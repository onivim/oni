import * as ChildProcess from "child_process"

import * as Config from "./../../Config"
import * as Platform from "./../../Platform"

const getPathSeparator = () => {
    return Platform.isWindows() ? ";" : ":"
}

const mergePathEnvironmentVariable = (currentPath: string, pathsToAdd: string[]): string => {
    if (!pathsToAdd || !pathsToAdd.length) {
        return currentPath
    }

    const separator = getPathSeparator()

    const joinedPathsToAdd = pathsToAdd.join(separator)

    return currentPath + separator + joinedPathsToAdd + separator
}

const mergeSpawnOptions = (originalSpawnOptions: ChildProcess.ExecOptions | ChildProcess.SpawnOptions): any => {
    const requiredOptions = {
        env: {
            ...process.env,
            ...originalSpawnOptions.env,
        },
    }

    const existingPath = process.env.Path || process.env.PATH

    requiredOptions.env.PATH = mergePathEnvironmentVariable(existingPath, Config.instance().getValue("environment.additionalPaths"))

    return {
        ...originalSpawnOptions,
        ...requiredOptions,
    }
}

/**
 * API surface area responsible for handling process-related tasks
 * (spawning processes, managing running process, etc)
 */
export class Process {

    public execNodeScript(scriptPath: string, args: string[] = [], options: ChildProcess.ExecOptions = {}, callback: (err: any, stdout: string, stderr: string) => void): ChildProcess.ChildProcess {
        const spawnOptions = mergeSpawnOptions(options)
        spawnOptions.env.ELECTRON_RUN_AS_NODE = 1

        const execOptions = [process.execPath, scriptPath].concat(args)
        const execString = execOptions.map((s) => `"${s}"`).join(" ")

        return ChildProcess.exec(execString, spawnOptions, callback)
    }

    /**
     * Wrapper around `child_process.exec` to run using electron as opposed to node
     */
    public spawnNodeScript(scriptPath: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): ChildProcess.ChildProcess {
        const spawnOptions = mergeSpawnOptions(options)
        spawnOptions.env.ELECTRON_RUN_AS_NODE = 1

        const allArgs = [scriptPath].concat(args)

        return ChildProcess.spawn(process.execPath, allArgs, spawnOptions)
    }

    /**
     * Spawn process - wrapper around `child_process.spawn`
     */
    public spawnProcess(startCommand: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): ChildProcess.ChildProcess {
        const spawnOptions = mergeSpawnOptions(options)

        return ChildProcess.spawn(startCommand, args, spawnOptions)
    }
}
