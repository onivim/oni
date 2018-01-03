import * as ChildProcess from "child_process"
import * as OniApi from "oni-api"

import * as Log from "./../../Log"
import * as Platform from "./../../Platform"
import { Configuration, configuration } from "./../../Services/Configuration"

export class Process implements OniApi.Process {

    constructor(
        private _configuration: Configuration,
    ) {
    }

    private getPathSeparator(): string {
        return Platform.isWindows() ? ";" : ":"
    }

    private mergePathEnvironmentVariable(currentPath: string, pathsToAdd: string[]): string {
        if (!pathsToAdd || !pathsToAdd.length) {
            return currentPath
        }

        const separator = this.getPathSeparator()

        const joinedPathsToAdd = pathsToAdd.join(separator)

        return currentPath + separator + joinedPathsToAdd
    }

    private async mergeSpawnOptions(originalSpawnOptions: ChildProcess.ExecOptions | ChildProcess.SpawnOptions): Promise<any> {
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

        requiredOptions.env.PATH = this.mergePathEnvironmentVariable(existingPath, this._configuration.getValue("environment.additionalPaths"))

        return {
            ...originalSpawnOptions,
            ...requiredOptions,
        }
    }

    /**
     * API surface area responsible for handling process-related tasks
     * (spawning processes, managing running process, etc)
     */
    public async execNodeScript(scriptPath: string, args: string[] = [], options: ChildProcess.ExecOptions = {}, callback: (err: any, stdout: string, stderr: string) => void): Promise<ChildProcess.ChildProcess> {
        const spawnOptions = await this.mergeSpawnOptions(options)
        spawnOptions.env.ELECTRON_RUN_AS_NODE = 1

        const execOptions = [process.execPath, scriptPath].concat(args)
        const execString = execOptions.map((s) => `"${s}"`).join(" ")

        return ChildProcess.exec(execString, spawnOptions, callback)
    }

    /**
     * Wrapper around `child_process.exec` to run using electron as opposed to node
     */
    public async spawnNodeScript(scriptPath: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): Promise<ChildProcess.ChildProcess> {
        const spawnOptions = await this.mergeSpawnOptions(options)
        spawnOptions.env.ELECTRON_RUN_AS_NODE = 1

        const allArgs = [scriptPath].concat(args)

        return ChildProcess.spawn(process.execPath, allArgs, spawnOptions)
    }

    /**
     * Spawn process - wrapper around `child_process.spawn`
     */
    public async spawnProcess(startCommand: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): Promise<ChildProcess.ChildProcess> {
        const spawnOptions = await this.mergeSpawnOptions(options)

        const proc = ChildProcess.spawn(startCommand, args, spawnOptions)
        proc.on("error", (err: Error) => {
            Log.error(err)
        })

        return proc
    }
}

export const processManager = new Process(configuration)
