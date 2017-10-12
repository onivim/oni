/**
 * RipGrep.ts
 *
 * Gets command / arguments for packaged ripgrep command
 */

import * as path from "path"

import * as Platform from "./../../Platform"

export const getCommand = () => {
    const rootPath = path.join(__dirname, "node_modules", "vscode-ripgrep", "bin")
    const executableName = Platform.isWindows() ? "rg.exe" : "rg"
    return path.join(rootPath, executableName)
}

export const getArguments = (excludePaths: string[]) => {
    const ignoreArguments = excludePaths.reduce((prev, cur) => {
        return prev.concat(["-g", "!" + cur])
    }, [])

    return ["--files", "--hidden", "--case-sensitive"].concat(ignoreArguments)
}
