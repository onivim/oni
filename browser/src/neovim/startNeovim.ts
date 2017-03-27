/**
 * startNeovim.ts
 *
 * Handles initialization of a Neovim process, or connection to an existing Neovim process
 */

import * as cp from "child_process"
import * as path from "path"

import * as minimist from "minimist"
import * as Q from "q"

import * as Config from "./../Config"
import * as Platform from "./../Platform"
import { nodeRequire } from "./../Utility"

const attach = nodeRequire("neovim-client")

const attachAsPromise = Q.denodeify(attach)

export const startNeovim = (runtimePaths: string[], args: minimist.ParsedArgs): Q.IPromise<any> {

    const filesToOpen = args._ || []

    const nvimWindowsProcessPath = path.join(__dirname, "bin", "x86", "Neovim", "bin", "nvim.exe")
    const noopInitVimPath = path.join(__dirname, "vim", "noop.vim")

    // For Mac / Linux, assume there is a locally installed neovim
    const nvimMacProcessPath = "nvim"
    const nvimProcessPath = Platform.isWindows() ? nvimWindowsProcessPath : nvimMacProcessPath

    const joinedRuntimePaths = runtimePaths.join(",")

    const shouldLoadInitVim = Config.instance().getValue<boolean>("oni.loadInitVim")
    const useDefaultConfig = Config.instance().getValue<boolean>("oni.useDefaultConfig")

    const vimRcArg = (shouldLoadInitVim || !useDefaultConfig) ? [] : ["-u", noopInitVimPath]

    const argsToPass = vimRcArg
        .concat(["--cmd", "set rtp+=" + joinedRuntimePaths, "--cmd", "let g:gui_oni = 1", "-N", "--embed", "--"])
        .concat(filesToOpen)

    const nvimProc = cp.spawn(nvimProcessPath, argsToPass, {})

    return attachAsPromise(nvimProc.stdin, nvimProc.stdout)
}
