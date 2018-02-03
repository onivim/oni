import { ChildProcess } from "child_process"
import * as net from "net"
import * as path from "path"

import * as Platform from "./../Platform"
import { spawnProcess } from "./../Plugins/Api/Process"

import { Session } from "./Session"

import * as Log from "./../Log"

// Most of the paths coming in the packaged binary reference the `app.asar`,
// but the binaries (Neovim) as well as the .vim files are unpacked,
// so these need to be mapped to the `app.asar.unpacked` directory
const remapPathToUnpackedAsar = (originalPath: string) => {
    return originalPath.split("app.asar").join("app.asar.unpacked")
}

export type MsgPackTransport = "stdio" | "pipe"

export interface INeovimStartOptions {
    runtimePaths?: string[]
    transport?: MsgPackTransport

    // If `true`, load init.vim from default path
    // If a string, override and load init.vim from the specified path
    loadInitVim: boolean | string

    // Whether or not to use Oni's default, opinionated plugins
    useDefaultConfig: boolean

    // Explicitly specify the path to Neovim. If not specified,
    // the default path will be used.
    neovimPath?: string
}

const DefaultStartOptions: INeovimStartOptions = {
    runtimePaths: [],
    transport: "stdio",
    loadInitVim: true,
    useDefaultConfig: true,
}

const getSessionFromProcess = async (
    neovimProcess: ChildProcess,
    transport: MsgPackTransport = "stdio",
): Promise<Session> => {
    Log.info("Initializing neovim process using transport: " + transport)

    const stdioSession = new Session(neovimProcess.stdin, neovimProcess.stdout)

    if (transport === "stdio") {
        return stdioSession
    }

    const namedPipe = await stdioSession.request<string>("nvim_eval", ["v:servername"])

    const client = net.createConnection(namedPipe, () => {
        Log.info("NeovimProcess - connected via named pipe: " + namedPipe)
    })

    return new Session(client, client)
}

export const startNeovim = async (
    options: INeovimStartOptions = DefaultStartOptions,
): Promise<Session> => {
    const runtimePaths = options.runtimePaths || []

    const noopInitVimPath = remapPathToUnpackedAsar(path.join(__dirname, "vim", "noop.vim"))

    const nvimWindowsProcessPath = path.join(
        __dirname,
        "node_modules",
        "oni-neovim-binaries",
        "bin",
        "Neovim",
        "bin",
        "nvim.exe",
    )
    const nvimMacProcessPath = path.join(
        __dirname,
        "node_modules",
        "oni-neovim-binaries",
        "bin",
        "nvim-osx64",
        "bin",
        "nvim",
    )

    // Assume nvim is available in path for Linux
    const nvimLinuxPath = process.env["ONI_NEOVIM_PATH"] || "nvim" // tslint:disable-line

    let nvimProcessPath = Platform.isWindows()
        ? nvimWindowsProcessPath
        : Platform.isMac() ? nvimMacProcessPath : nvimLinuxPath

    nvimProcessPath = remapPathToUnpackedAsar(nvimProcessPath)

    if (options.neovimPath) {
        nvimProcessPath = options.neovimPath
    }

    Log.info("[NeovimProcessSpawner::startNeovim] Neovim process path: " + nvimProcessPath)

    const joinedRuntimePaths = runtimePaths.map(p => remapPathToUnpackedAsar(p)).join(",")

    const loadInitVimConfigOption = options.loadInitVim
    const useDefaultConfig = options.useDefaultConfig

    let initVimArg = []
    initVimArg = loadInitVimConfigOption || !useDefaultConfig ? [] : ["-u", noopInitVimPath]

    if (typeof loadInitVimConfigOption === "string") {
        initVimArg = ["-u", loadInitVimConfigOption]
    }

    const argsToPass = initVimArg.concat([
        "--cmd",
        `let &rtp.=',${joinedRuntimePaths}'`,
        "--cmd",
        "let g:gui_oni = 1",
        "-N",
        "--embed",
        "--",
    ])

    const nvimProc = await spawnProcess(nvimProcessPath, argsToPass, {})

    Log.info(`[NeovimProcessSpawner::startNeovim] Starting Neovim - process: ${nvimProc.pid}`) // tslint:disable-line no-console

    return getSessionFromProcess(nvimProc, options.transport)
}
