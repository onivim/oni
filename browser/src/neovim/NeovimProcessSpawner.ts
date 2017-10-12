import * as cp from "child_process"
import * as path from "path"

import * as Platform from "./../Platform"
import { configuration } from "./../Services/Configuration"

import { Session } from "./Session"

// Most of the paths coming in the packaged binary reference the `app.asar`,
// but the binaries (Neovim) as well as the .vim files are unpacked,
// so these need to be mapped to the `app.asar.unpacked` directory
const remapPathToUnpackedAsar = (originalPath: string) => {
    return originalPath.split("app.asar").join("app.asar.unpacked")
}

export const startNeovim = (runtimePaths: string[], args: string[]): Session => {

    const noopInitVimPath = remapPathToUnpackedAsar(path.join(__dirname, "vim", "noop.vim"))

    const nvimWindowsProcessPath = path.join(__dirname, "bin", "x86", "Neovim", "bin", "nvim.exe")
    const nvimMacProcessPath = path.join(__dirname, "bin", "osx", "neovim", "bin", "nvim")

    // For Linux, assume there is a locally installed neovim
    const nvimLinuxPath = "nvim"

    let nvimProcessPath = Platform.isWindows() ? nvimWindowsProcessPath : Platform.isMac() ? nvimMacProcessPath : nvimLinuxPath

    nvimProcessPath = remapPathToUnpackedAsar(nvimProcessPath)

    const neovimPath = configuration.getValue("debug.neovimPath")

    if (neovimPath) {
        nvimProcessPath = neovimPath
    }

    const joinedRuntimePaths = runtimePaths
                                    .map((p) => remapPathToUnpackedAsar(p))
                                    .join(",")

    const loadInitVimConfigOption = configuration.getValue("oni.loadInitVim")
    const useDefaultConfig = configuration.getValue("oni.useDefaultConfig")

    let initVimArg = []
    initVimArg = (loadInitVimConfigOption || !useDefaultConfig) ? [] : ["-u", noopInitVimPath]

    if (typeof(loadInitVimConfigOption) === "string") {
        initVimArg = ["-u", loadInitVimConfigOption]
    }

    const argsToPass = initVimArg
        .concat(["--cmd", `let &rtp.='${joinedRuntimePaths}'`, "--cmd", "let g:gui_oni = 1", "-N", "--embed", "--"])
        .concat(args)

    const nvimProc = cp.spawn(nvimProcessPath, argsToPass, {})

    console.log(`Starting Neovim - process: ${nvimProc.pid}`) // tslint:disable-line no-console

    return new Session(nvimProc.stdin, nvimProc.stdout)
}
