import * as Q from "q"

import { exec } from "child_process"
import { INeovimInstance } from "./../NeovimInstance"
import { IBuffer } from "./../neovim/Buffer"
import { IWindow } from "./../neovim/Window"

/**
 * Window that shows terminal output
 */

export class OutputWindow {

    private _neovimInstance: INeovimInstance
    private _currentWindow: IWindow = null
    private _currentBuffer: IBuffer = null

    constructor(neovimInstance: INeovimInstance) {
        this._neovimInstance = neovimInstance
    }

    public open(): Q.Promise<void> {
        return this._isWindowOpen()
            .then((open) => {
                if (!open) {
                    return this._neovimInstance.command("rightbelow 20new OUPUT")
                        .then(() => this._neovimInstance.getCurrentWindow())
                        .then((win) => this._currentWindow = win)
                        .then(() => this._neovimInstance.getCurrentBuffer())
                        .then((buf) => this._currentBuffer = buf)
                        .then(() => this._currentBuffer.setOption("buftype", "nofile"))
                        .then(() => this._currentBuffer.setOption("bufhidden", "hide"))
                        .then(() => this._currentBuffer.setOption("swapfile", false))
                        .then(() => this._currentBuffer.setOption("filetype", "output"))
                }
            })
    }

    public execute(shellCommand: string): Q.Promise<void> {
        this.write([shellCommand])

        var proc = exec(shellCommand, (err: any, stdout, stderr) => {
            if (err)
                console.error(err)
        })

        proc.stdout.on("data", (data) => this.write(data.toString().split("\n")))
        proc.stderr.on("data", (data) => this.write(data.toString().split("\n")))
        proc.on("close", (data) => {
            this.write([`process excited with code ${data}`])
        })
        return Q.resolve(null)

    }

    public write(val: string[]): Q.Promise<void> {
        return this.open()
            .then(() => this._currentBuffer.appendLines(val))
    }

    private _isWindowOpen(): Q.Promise<boolean> {
        if (!this._currentWindow || !this._currentBuffer)
            return Q.resolve(false)

        return this._currentWindow.isValid()
    }
}
