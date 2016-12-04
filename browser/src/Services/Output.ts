import { exec } from "child_process"
import * as Q from "q"
import { IBuffer } from "./../neovim/Buffer"
import { IWindow } from "./../neovim/Window"
import { INeovimInstance } from "./../NeovimInstance"
import { PluginManager } from "./../Plugins/PluginManager"

/**
 * Window that shows terminal output
 */

export class OutputWindow {

    private _neovimInstance: INeovimInstance
    private _currentWindow: IWindow = <any> null // FIXME: null
    private _currentBuffer: IBuffer = <any> null // FIXME: null

    constructor(neovimInstance: INeovimInstance, pluginManager: PluginManager) {
        this._neovimInstance = neovimInstance

        pluginManager.on("execute-shell-command", (_payload: any) => {
            // const command = payload.command

            // this.execute(command)
        })
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
                } else {
                    return
                }
            })
    }

    public execute(shellCommand: string): Q.Promise<void> {
        this.write([shellCommand])

        const proc = exec(shellCommand, (err: any, _stdout: any, _stderr: any) => {
            if (err) {
                console.error(err)
            }
        })

        proc.stdout.on("data", (data) => this.write(data.toString().split("\n")))
        proc.stderr.on("data", (data) => this.write(data.toString().split("\n")))
        proc.on("close", (data) => {
            this.write([`process excited with code ${data}`])
        })
        return Q.resolve(undefined)

    }

    public write(val: string[]): Q.Promise<void> {
        return this.open()
            .then(() => this._currentBuffer.appendLines(val))
    }

    private _isWindowOpen(): Q.Promise<boolean> {
        if (!this._currentWindow || !this._currentBuffer) {
            return Q.resolve(false)
        }

        return this._currentWindow.isValid()
    }
}
