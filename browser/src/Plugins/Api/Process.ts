import * as ChildProcess from "child_process"

import * as Oni from "oni-api"
import * as Log from "oni-core-logging"

import * as Platform from "./../../Platform"
import { configuration } from "./../../Services/Configuration"

export interface IShellEnvironmentFetcher {
    getEnvironmentVariables(): Promise<any>
}

interface IShellEnv {
    default: {
        sync: (shell?: string) => NodeJS.ProcessEnv
    }
}

export class ShellEnvironmentFetcher implements IShellEnvironmentFetcher {
    private _shellEnvPromise: Promise<any>
    private _shellEnv: IShellEnv

    constructor() {
        // Dynamic imports return { default: Module }
        this._shellEnvPromise = import("shell-env")
    }

    public async getEnvironmentVariables(): Promise<NodeJS.ProcessEnv> {
        if (!this._shellEnv) {
            this._shellEnv = await this._shellEnvPromise
        }
        try {
            const env = this._shellEnv.default.sync()
            return env
        } catch (error) {
            Log.warn(
                `[Oni environment fetcher]: unable to get enviroment variables because: ${
                    error.message
                }`,
            )
            return {}
        }
    }
}

export class Process implements Oni.Process {
    public _spawnedProcessIds: number[] = []
    private _env: NodeJS.ProcessEnv

    constructor(
        private _shellEnvironmentFetcher: IShellEnvironmentFetcher = new ShellEnvironmentFetcher(),
    ) {}

    public getPathSeparator = () => {
        return Platform.isWindows() ? ";" : ":"
    }

    public mergePathEnvironmentVariable = (currentPath: string, pathsToAdd: string[]): string => {
        if (!pathsToAdd || !pathsToAdd.length) {
            return currentPath
        }

        const separator = this.getPathSeparator()

        const joinedPathsToAdd = pathsToAdd.join(separator)

        return currentPath + separator + joinedPathsToAdd
    }

    /**
     * API surface area responsible for handling process-related tasks
     * (spawning processes, managing running process, etc)
     */
    public execNodeScript = async (
        scriptPath: string,
        args: string[] = [],
        options: ChildProcess.ExecOptions = {},
        callback: (err: any, stdout: string, stderr: string) => void,
    ): Promise<ChildProcess.ChildProcess> => {
        const spawnOptions = await this.mergeSpawnOptions(options)
        spawnOptions.env.ELECTRON_RUN_AS_NODE = 1

        const execOptions = [process.execPath, scriptPath].concat(args)
        const execString = execOptions.map(s => `"${s}"`).join(" ")

        const proc = ChildProcess.exec(execString, spawnOptions, callback)
        this._spawnedProcessIds.push(proc.pid)
        return proc
    }

    /**
     * Get the set of process IDs that were spawned by Oni
     */
    public getPIDs = (): number[] => {
        return [...this._spawnedProcessIds]
    }

    /**
     * Get the __dirname of currently executing file
     */
    public getDirname = () => {
        return __dirname
    }

    /**
     * Wrapper around `child_process.exec` to run using electron as opposed to node
     */
    public spawnNodeScript = async (
        scriptPath: string,
        args: string[] = [],
        options: ChildProcess.SpawnOptions = {},
    ): Promise<ChildProcess.ChildProcess> => {
        const spawnOptions = await this.mergeSpawnOptions(options)
        spawnOptions.env.ELECTRON_RUN_AS_NODE = 1

        const allArgs = [scriptPath].concat(args)

        const proc = ChildProcess.spawn(process.execPath, allArgs, spawnOptions)
        this._spawnedProcessIds.push(proc.pid)
        return proc
    }

    /**
     * Spawn process - wrapper around `child_process.spawn`
     */
    public spawnProcess = async (
        startCommand: string,
        args: string[] = [],
        options: ChildProcess.SpawnOptions = {},
    ): Promise<ChildProcess.ChildProcess> => {
        const spawnOptions = await this.mergeSpawnOptions(options)

        const proc = ChildProcess.spawn(startCommand, args, spawnOptions)
        this._spawnedProcessIds.push(proc.pid)
        proc.on("error", (err: Error) => {
            Log.error(err)
        })

        return proc
    }

    public mergeSpawnOptions = async (
        originalSpawnOptions: ChildProcess.ExecOptions | ChildProcess.SpawnOptions,
    ): Promise<any> => {
        let existingPath: string

        try {
            if (!this._env) {
                this._env = await this._shellEnvironmentFetcher.getEnvironmentVariables()
            }
            existingPath = process.env.Path || process.env.PATH
        } catch (e) {
            existingPath = process.env.Path || process.env.PATH
        }

        const requiredOptions = {
            env: {
                ...process.env,
                ...this._env,
                ...originalSpawnOptions.env,
            },
        }

        requiredOptions.env.PATH = this.mergePathEnvironmentVariable(
            existingPath,
            configuration.getValue("environment.additionalPaths"),
        )

        return {
            ...originalSpawnOptions,
            ...requiredOptions,
        }
    }
}

export default new Process()
