import * as ChildProcess from "child_process"

/**
 * API surface area responsible for handling process-related tasks
 * (spawning processes, managing running process, etc)
 */
export class Process {

    public execNodeScript(scriptPath: string, args: string[] = [], options: ChildProcess.ExecOptions = {}, callback: (err: any, stdout: string, stderr: string) => void): ChildProcess.ChildProcess {
        const requiredOptions = {
            env: {
                ...process.env,
                ELECTRON_RUN_AS_NODE: 1,
            },
        }

        const opts = {
            ...options,
            ...requiredOptions,
        }

        const execOptions = [process.execPath, scriptPath].concat(args)
        const execString = execOptions.map((s) => `"${s}"`).join(" ")

        return ChildProcess.exec(execString, opts, callback)
    }

    /**
     * Wrapper around `child_process.exec` to run using electron as opposed to node
     */
    public spawnNodeScript(scriptPath: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): ChildProcess.ChildProcess {

        const spawnOptions = this._mergeSpawnOptions(options)

        // Need to merge in `ELECTRON_RUN_AS_NODE` environment variable
        const requiredOptions = {
            env: {
                ...spawnOptions.env,
                ELECTRON_RUN_AS_NODE: 1,
            },
        }

        const finalOpts = {
            ...spawnOptions,
            ...requiredOptions,
        }

        const allArgs = [scriptPath].concat(args)

        return ChildProcess.spawn(process.execPath, allArgs, finalOpts)
    }

    /**
     * Spawn process - wrapper around `child_process.spawn`
     */
    public spawnProcess(startCommand: string, args: string[] = [], options: ChildProcess.SpawnOptions = {}): ChildProcess.ChildProcess {

        const spawnOptions = this._mergeSpawnOptions(options)

        return ChildProcess.spawn(startCommand, args, spawnOptions)
    }

    private _mergeSpawnOptions(originalSpawnOptions: ChildProcess.SpawnOptions): ChildProcess.SpawnOptions {
        // TODO: Append environment variables
        const requiredOptions = {
            env: {
                ...process.env,
            },
        }

        return {
            ...requiredOptions,
            ...originalSpawnOptions,
        }
    }
}
