import * as cp from "child_process"
import * as path from "path"

import * as Config from "./../Config"
import * as Platform from "./../Platform"

import { Session } from "./Session"

export const startNeovim = (runtimePaths: string[], args: string[]): Session => {

    const noopInitVimPath = path.join(__dirname, "vim", "noop.vim")

    const nvimWindowsProcessPath = path.join(__dirname, "bin", "x86", "Neovim", "bin", "nvim.exe")
    const nvimMacProcessPath = path.join(__dirname, "bin", "osx", "neovim", "bin", "nvim")
    // For Linux, assume there is a locally installed neovim
    const nvimLinuxPath = "nvim"

    const nvimProcessPath = Platform.isWindows() ? nvimWindowsProcessPath : Platform.isMac() ? nvimMacProcessPath : nvimLinuxPath

    const joinedRuntimePaths = runtimePaths.join(",")

    const shouldLoadInitVim = Config.instance().getValue("oni.loadInitVim")
    const useDefaultConfig = Config.instance().getValue("oni.useDefaultConfig")

    const vimRcArg = (shouldLoadInitVim || !useDefaultConfig) ? [] : ["-u", noopInitVimPath]

    const argsToPass = vimRcArg
        .concat(["--cmd", `let &rtp.='${joinedRuntimePaths}'`, "--cmd", "let g:gui_oni = 1", "-N", "--embed", "--"])
        .concat(args)

    const nvimProc = cp.spawn(nvimProcessPath, argsToPass, {})

    console.log(`Starting Neovim - process: ${nvimProc.pid}`) // tslint:disable-line no-console

    return new Session(nvimProc.stdin, nvimProc.stdout)
}
