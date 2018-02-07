/**
 * FinderProcess.ts
 *
 * Manages communication with the external finder process
 */

import { ChildProcess, spawn } from "child_process"

import { Event, IEvent } from "oni-types"

import * as Log from "./../../Log"

export class FinderProcess {
    private _process: ChildProcess

    private _lastData: string = ""

    private _onData = new Event<string[]>()
    private _onError = new Event<string>()
    private _onComplete = new Event<void>()

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

        this._process = spawn(this._command, [], { shell: true })
        this._process.stdout.on("data", data => {
            if (!data) {
                return
            }

            const dataString = data.toString()
            const isCleanEnd = dataString.endsWith(this._splitCharacter)
            const splitData = dataString.split(this._splitCharacter)

            if (this._lastData && splitData.length > 0) {
                splitData[0] = this._lastData + splitData[0]
                this._lastData = ""
            }

            if (!isCleanEnd) {
                this._lastData = splitData.pop()
            }

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
