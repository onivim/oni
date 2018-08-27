import * as path from "path"
import { CLIArgs, parseCLIProcessArgv } from "./cli_args"

import { spawn } from "child_process"

export async function main(cli_arguments: string[]): Promise<any> {
    // First, try to parse the CLI args and deal with them.
    let args: CLIArgs

    try {
        args = parseCLIProcessArgv(cli_arguments)
    } catch (err) {
        process.stdout.write(err.message)
        throw err
    }

    if (args.help || args.version) {
        const version = require(path.join(__dirname, "..", "..", "..", "package.json")).version // tslint:disable-line no-var-requires
        process.stdout.write("Oni: Modern Modal Editing - powered by Neovim\n")
        process.stdout.write(` version: ${version}\n`)
        process.stdout.write("\nUsage:\n oni [FILE]\t\tEdit file\n")
        process.stdout.write("\nhttps://github.com/onivim/oni\n")

        return Promise.resolve(true)
    }

    // Otherwise, was loaded normally, so launch Oni.

    const shellEnvPromise = import("shell-env")
    const shellEnv = (await shellEnvPromise).sync()

    const env = assign({}, process.env, shellEnv, {
        ONI_CLI: "1", // Let Oni know it was started from the CLI
        ONI_CLI_LAUNCH_FOLDER: process.cwd(), // The folder that Oni was launched from.
        ELECTRON_NO_ATTACH_CONSOLE: "1",
    })

    delete env["ELECTRON_RUN_AS_NODE"]

    const options = {
        detached: true,
        env,
    }

    const child = await spawn(process.execPath, cli_arguments.slice(2), options)
    child.unref()

    child.on("close", code => {
        if (code !== 0) {
            throw Error(`Exit code was ${code}, not 0.`)
        } else {
            return Promise.resolve(true)
        }
    })

    child.on("error", err => {
        throw err
    })

    child.on("exit", code => {
        if (code && code !== 0) {
            throw Error(`Exit code was ${code}, not 0.`)
        } else {
            return Promise.resolve(true)
        }
    })
}

function assign(destination: any, ...sources: any[]): any {
    sources.forEach(source => Object.keys(source).forEach(key => (destination[key] = source[key])))
    return destination
}

function eventuallyExit(code: number): void {
    setTimeout(() => process.exit(code), 0)
}

main(process.argv)
    .then(() => {
        eventuallyExit(0)
    })
    .then(null, err => {
        console.error(err.message || err.stack || err)
        eventuallyExit(1)
    })
