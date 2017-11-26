import * as ChildProcess from "child_process"
import * as util from "util"

import * as Platform from "./../../Platform"
import { configuration } from "./../../Services/Configuration"

const exec = util.promisify(ChildProcess.exec)
type ExecReturn = string | { stdout: string, stderr: string }

const getPathSeparator = () => {
    return Platform.isWindows() ? ";" : ":"
}

const mergePathEnvironmentVariable = (currentPath: ExecReturn, pathsToAdd: string[]): ExecReturn => {
    if (!pathsToAdd || !pathsToAdd.length) {
        return currentPath
    }

    const separator = getPathSeparator()

    const joinedPathsToAdd = pathsToAdd.join(separator)

    return currentPath + separator + joinedPathsToAdd + separator
}

const mergeSpawnOptions = async (originalSpawnOptions: ChildProcess.ExecOptions | ChildProcess.SpawnOptions): Promise<any> => {
    const requiredOptions = {
        env: {
            ...process.env,
            ...originalSpawnOptions.env,
        },
    }

    let existingPath: ExecReturn

    try {
        const pathCommand = Platform.isWindows() ? "echo %PATH%" : "echo $PATH"
        const path = await exec(pathCommand)

        existingPath = path || process.env.Path || process.env.PATH
    } catch (e) {
        existingPath = process.env.Path || process.env.PATH
    }

    requiredOptions.env.PATH = mergePathEnvironmentVariable(existingPath, configuration.getValue("environment.additionalPaths"))

    return {
        ...originalSpawnOptions,
        ...requiredOptions,
    }
}

/**
 * API surface area responsible for handling process-related tasks
 * (spawning processes, managing running process, etc)
 */
export const execNodeScript = async (scriptPath: string, args: string[] = [], options: ChildProcess.ExecOptions = {}, callback: (err: any, stdout: string, stderr: string) => void): Promise<ChildProcess.ChildProcess> => {
    const spawnOptions = await mergeSpawnOptions(options)
    spawnOptions.env.ELECTRON_RUN_AS_NODE = 1

    const execOptions = [process.execPath, scriptPath].concat(args)
    const execString = execOptions.map((s) => `"${s}"`).join(" ")

    return ChildProcess.exec(execString, spawnOptions, callback)
}

/**
 * Wrapper around `child_process.exec` to run using electron as opposed to node
 */
export const spawnNodeScript = async (scriptPath: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): Promise<ChildProcess.ChildProcess> => {
    const spawnOptions = await mergeSpawnOptions(options)
    spawnOptions.env.ELECTRON_RUN_AS_NODE = 1

    const allArgs = [scriptPath].concat(args)

    return ChildProcess.spawn(process.execPath, allArgs, spawnOptions)
}

/**
 * Spawn process - wrapper around `child_process.spawn`
 */
export const spawnProcess = async (startCommand: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): Promise<ChildProcess.ChildProcess> => {
    const spawnOptions = await mergeSpawnOptions(options)

    return ChildProcess.spawn(startCommand, args, spawnOptions)
    }
