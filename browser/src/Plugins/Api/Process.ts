import * as ChildProcess from "child_process"

import * as Log from "./../../Log"
import * as Platform from "./../../Platform"
import { configuration } from "./../../Services/Configuration"

const getPathSeparator = () => {
    return Platform.isWindows() ? ";" : ":"
}

const _spawnedProcessIds: number[] = []

const mergePathEnvironmentVariable = (currentPath: string, pathsToAdd: string[]): string => {
    if (!pathsToAdd || !pathsToAdd.length) {
        return currentPath
    }

    const separator = getPathSeparator()

    const joinedPathsToAdd = pathsToAdd.join(separator)

    return currentPath + separator + joinedPathsToAdd
}

const mergeSpawnOptions = async (originalSpawnOptions: ChildProcess.ExecOptions | ChildProcess.SpawnOptions): Promise<any> => {
    let existingPath: string

    try {
        const shellEnv = await import("shell-env")
        const shellEnvironment = await shellEnv()
        process.env = { ...process.env, ...shellEnvironment }
        existingPath = process.env.Path || process.env.PATH
    } catch (e) {
        existingPath = process.env.Path || process.env.PATH
    }

    const requiredOptions = {
        env: {
            ...process.env,
            ...originalSpawnOptions.env,
        },
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

    const proc = ChildProcess.exec(execString, spawnOptions, callback)
    _spawnedProcessIds.push(proc.pid)
    return proc
}

/**
 * Get the set of process IDs that were spawned by Oni
 */
export const getPIDs = (): number[] => {
    return [..._spawnedProcessIds]
}

/**
 * Wrapper around `child_process.exec` to run using electron as opposed to node
 */
export const spawnNodeScript = async (scriptPath: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): Promise<ChildProcess.ChildProcess> => {
    const spawnOptions = await mergeSpawnOptions(options)
    spawnOptions.env.ELECTRON_RUN_AS_NODE = 1

    const allArgs = [scriptPath].concat(args)

    const proc = ChildProcess.spawn(process.execPath, allArgs, spawnOptions)
    _spawnedProcessIds.push(proc.pid)
    return proc
}

/**
 * Spawn process - wrapper around `child_process.spawn`
 */
export const spawnProcess = async (startCommand: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): Promise<ChildProcess.ChildProcess> => {
    const spawnOptions = await mergeSpawnOptions(options)

    const proc = ChildProcess.spawn(startCommand, args, spawnOptions)
    _spawnedProcessIds.push(proc.pid)
    proc.on("error", (err: Error) => {
        Log.error(err)
    })

    return proc
    }
