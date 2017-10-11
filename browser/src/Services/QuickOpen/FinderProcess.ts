/**
 * FinderProcess.ts
 *
 * Manages communication with the external finder process
 */

import { Event, IEvent } from "./../../Event"

import { ChildProcess, spawn } from "child_process"

export class FinderProcess {

    private _process: ChildProcess

    private _isExplicitlyStopped: boolean = false
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

    constructor(private _command: string,
                private _args: string[],
                private _splitCharacter: string) {
    }

    public start(): void {
        if (this._process) {
            return
        }

        this._process = spawn(this._command, this._args)
        this._process.stdout.on("data", (data) => {
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

        this._process.stderr.on("data", (data) => {
            this._onError.dispatch(data.toString())
        })

        this._process.on("exit", (code) => {
            this._onComplete.dispatch()
        })
    }

    public stop(): void {
        this._isExplicitlyStopped = true
        this._process.kill()
    }
}
