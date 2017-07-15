import { exec } from "child_process"
import { IBuffer, INeovimInstance } from "./../neovim"
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

    public open(): Promise<IBuffer> {
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

    public async executeCommands(shellCommands: string[]): Promise<void[]> {
        const buf = await this.open()

        let promises = shellCommands.map(async (command) => {
            return await this._executeInBuffer(command, buf)
        })

        return await Promise.all(promises)
    }

    public async execute(shellCommand: string): Promise<void> {
        const buf = await this.open()
        return this._executeInBuffer(shellCommand, buf)
    }

    public write(val: string[], buffer: IBuffer): Promise<void> {
        return buffer.appendLines(val)
    }

    private async _executeInBuffer(shellCommand: string, buf: IBuffer): Promise<void> {

        let resolve: any
        let reject: any
        const promise = new Promise<void>((res, rej) => {
            resolve = res
            reject = rej
        })
        this.write([shellCommand], buf)

        const proc = exec(shellCommand, (err: any, _stdout: any, _stderr: any) => {
            if (err) {
                console.error(err)
                reject(err)
            }
        })

        proc.stdout.on("data", (data) => this.write(data.toString().split("\n"), buf))
        proc.stderr.on("data", (data) => this.write(data.toString().split("\n"), buf))
        proc.on("close", (data) => {
            this.write([`process excited with code ${data}`], buf)
            resolve()
        })

        return promise
    }
}
