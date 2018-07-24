/**
 * FinderProcess.ts
 *
 * Manages communication with the external finder process
 */

import { ChildProcess, spawn } from "child_process"

import { Event, IEvent } from "oni-types"

import * as Log from "oni-core-logging"
import { getInstance } from "./../Workspace"

export class FinderProcess {
    private _process: ChildProcess

    private _lastData: string = ""

    private _onData = new Event<string[]>()
    private _onError = new Event<string>()
    private _onComplete = new Event<void>()
    private _workspace = getInstance()

    public get onData(): IEvent<string[]> {
        return this._onData
    }

    public get onComplete(): IEvent<void> {
        return this._onComplete
    }

    constructor(private _command: string, private _splitCharacter: string) {}

    public start(): void {
        if (this._process) {
            return
        }

        if (Log.isDebugLoggingEnabled()) {
            Log.debug(
                "[FinderProcess::start] Starting finder process with this command: " +
                    this._command,
            )
        }

        this._process = spawn(this._command, [], {
            shell: true,
            cwd: this._workspace.activeWorkspace,
        })
        this._process.stdout.on("data", data => {
            const { didExtract, remnant, splitData } = extractSplitData(
                data,
                this._splitCharacter,
                this._lastData,
            )

            if (!didExtract) {
                return
            }

            this._lastData = remnant

            this._onData.dispatch(splitData)
        })

        this._process.stderr.on("data", data => {
            this._onError.dispatch(data.toString())
        })

        this._process.on("exit", code => {
            this._onComplete.dispatch()
        })
    }

    public stop(): void {
        this._process.kill()
    }
}

export const extractSplitData = (
    data: string | Buffer,
    splitCharacter: string,
    lastRemnant: string,
) => {
    if (!data) {
        return {
            didExtract: false,
            remnant: "",
            splitData: [],
        }
    }

    const dataString = lastRemnant + data.toString()
    const isCleanEnd = dataString.endsWith(splitCharacter)
    const splitData = dataString.split(splitCharacter)

    let remnant = ""

    if (!isCleanEnd) {
        remnant = splitData.pop()
    } else {
        // split leaves behind an empty string in the array if the string to split ends with the delimiter
        splitData.splice(-1, 1)
    }

    return { didExtract: true, remnant, splitData }
}
