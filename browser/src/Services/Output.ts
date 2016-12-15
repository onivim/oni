import { exec } from "child_process"
import * as Q from "q"
import { IBuffer } from "./../neovim/Buffer"
import { INeovimInstance } from "./../NeovimInstance"
import { PluginManager } from "./../Plugins/PluginManager"

/**
 * Window that shows terminal output
 */

export class OutputWindow {

    private _neovimInstance: INeovimInstance
    private _outputCount: number = 0

    constructor(neovimInstance: INeovimInstance, pluginManager: PluginManager) {
        this._neovimInstance = neovimInstance

        pluginManager.on("execute-shell-command", (_payload: any) => {
            // const command = payload.command

            // this.execute(command)
        })
    }

    public open(): Q.Promise<IBuffer> {
        this._outputCount++
        let buffer: IBuffer
        return this._neovimInstance.command("rightbelow 20new OUTPUT" + this._outputCount.toString())
            .then(() => this._neovimInstance.getCurrentWindow())
            .then(() => this._neovimInstance.getCurrentBuffer())
            .then((buf) => buffer = buf)
            .then(() => buffer.setOption("buftype", "nofile"))
            .then(() => buffer.setOption("bufhidden", "hide"))
            .then(() => buffer.setOption("swapfile", false))
            .then(() => buffer.setOption("filetype", "output"))
            .then(() => buffer)
    }

    public execute(shellCommand: string): Q.Promise<void> {
        return this.open()
            .then((buf) => {
                this.write([shellCommand], buf)

                const proc = exec(shellCommand, (err: any, _stdout: any, _stderr: any) => {
                    if (err) {
                        console.error(err)
                    }
                })

                proc.stdout.on("data", (data) => this.write(data.toString().split("\n"), buf))
                proc.stderr.on("data", (data) => this.write(data.toString().split("\n"), buf))
                proc.on("close", (data) => {
                    this.write([`process excited with code ${data}`], buf)
                })
            })
    }

    public write(val: string[], buffer: IBuffer): Q.Promise<void> {
        return buffer.appendLines(val)
    }
}
