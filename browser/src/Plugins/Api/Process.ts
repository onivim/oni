import * as ChildProcess from "child_process"
import * as Oni from "oni-api"

import * as Log from "./../../Log"
import * as Platform from "./../../Platform"
import { configuration } from "./../../Services/Configuration"

export interface IShellEnvironmentFetcher {
    getEnvironmentVariables(): Promise<NodeJS.ProcessEnv>
}

export class ShellEnvironmentFetcher implements IShellEnvironmentFetcher {
    public _env: NodeJS.ProcessEnv

    constructor(private _shellEnvPromise = import("shell-env")) {}

    public async getEnvironmentVariables(): Promise<NodeJS.ProcessEnv> {
        if (!this._env) {
            const shellEnv = await this._shellEnvPromise
            // TODO:
            // Shell Env currently doesn't derive the users
            // shell correctly for non-Windows systems
            // https://github.com/sindresorhus/default-shell/issues/3
            // const { shell } = os.userInfo() - this accomplishes that
            // though issue here is that it reads the relevant dotfile which
            // if it has issues will stop oni from starting up
            try {
                this._env = shellEnv.default.sync()
            } catch {
                this._env = process.env
            }
            this._fixPath()
        }

        return this._env
    }

    private _fixPath() {
        // Set the PATH to a derived path on MacOS as this is not set correctly in electron
        // the idea is based on https://github.com/sindresorhus/fix-path
        if (Platform.isMac() && this._env.PATH) {
            process.env.PATH = this._env.PATH
        }
    }
}

export class Process implements Oni.Process {
    public _spawnedProcessIds: number[] = []
    private _env: NodeJS.ProcessEnv

    constructor(private _shellEnvFetcher: IShellEnvironmentFetcher) {}

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

    public getPath() {
        return this._env ? this._env.PATH : process.env.Path || process.env.PATH
    }

    public mergeSpawnOptions = async (
        originalSpawnOptions: ChildProcess.ExecOptions | ChildProcess.SpawnOptions,
    ): Promise<any> => {
        if (!this._env) {
            try {
                this._env = await this._shellEnvFetcher.getEnvironmentVariables()
            } catch (e) {
                Log.error(
                    `[Oni Process Error]: failed to fetch shell environment because ${e.message}`,
                )
            }
        }

        const requiredOptions = {
            env: {
                ...process.env,
                ...(this._env || {}),
                ...originalSpawnOptions.env,
            } as NodeJS.ProcessEnv,
        }

        requiredOptions.env.PATH = this.mergePathEnvironmentVariable(
            this.getPath(),
            configuration.getValue("environment.additionalPaths"),
        )

        return {
            ...originalSpawnOptions,
            ...requiredOptions,
        }
    }
}

const shellEnvFetcher = new ShellEnvironmentFetcher()
const OniProcess = new Process(shellEnvFetcher)

export default OniProcess
