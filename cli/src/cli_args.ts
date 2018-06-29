import * as minimist from "minimist"

export interface CLIArgs {
    help?: boolean
    version?: boolean
    [arg: string]: any
}

const options: minimist.Opts = {
    boolean: ["help", "version"],
    alias: {
        help: "h",
        version: "v",
    },
}

export function parseArgs(args: string[]): CLIArgs {
    return minimist(args, options) as CLIArgs
}

export function parseCLIProcessArgv(processArgv: string[]): CLIArgs {
    let [, , ...args] = processArgv

    // if (process.env['VSCODE_DEV']) {
    //     args = stripAppPath(args);
    // }

    return parseArgs(args)
}
