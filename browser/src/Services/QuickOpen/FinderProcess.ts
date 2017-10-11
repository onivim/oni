/**
 * QuickOpen.ts
 *
 * Manages the quick open menu
 */

// import { spawn } from "child_process"
import { lstatSync } from "fs"

// import * as glob from "glob"
import * as path from "path"
// import * as Log from "./../Log"

import { IEvent, Event } from "./../Event"

import { INeovimInstance } from "./../neovim"
import { BufferUpdates } from "./BufferUpdates"

import { commandManager } from "./../Services/CommandManager"
import { configuration } from "./../Services/Configuration"
import { Menu, menuManager } from "./../Services/Menu"

import { spawn, ChildProcess } from 'child_process'

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
        this._process.stdout.on('data', (data) => {
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

        this._process.stderr.on('data', (data) => {
            this._onError.dispatch(data.toString())
        })

        this._process.on('exit', (code) => {
            this._onComplete.dispatch()
        })
    }

    public stop(): void {
        this._isExplicitlyStopped = true
        this._process.kill()
    }
}
