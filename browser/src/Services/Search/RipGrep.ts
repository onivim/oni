/**
 * RipGrep.ts
 *
 * Gets command / arguments for packaged ripgrep command
 */

import * as path from "path"

import * as Platform from "./../../Platform"

export function getCommand(): string {
    const rootPath = path.join(__dirname, "node_modules", "oni-ripgrep", "bin")
    const executableName = Platform.isWindows() ? "rg.exe" : "rg"

    // Wrap in quotes in case there are spaces in the path
    return '"' + path.join(rootPath, executableName) + '"'
}

export function getArguments(excludePaths: string[], shouldShowHidden: boolean): string[] {
    const ignoreArguments = excludePaths.reduce((prev, cur) => {
        return prev.concat(["-g", "!" + cur])
    }, [])

    const showHidden = shouldShowHidden ? ["--hidden"] : []

    return ["--vimgrep"].concat(showHidden, ignoreArguments)
}
