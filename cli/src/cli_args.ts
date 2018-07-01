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

// Skip the first 2 arguments as that is the location of the Electron binary,
// and the location of the cli.ts script.
export function parseCLIProcessArgv(processArgv: string[]): CLIArgs {
    let [, , ...args] = processArgv

    return parseArgs(args)
}
