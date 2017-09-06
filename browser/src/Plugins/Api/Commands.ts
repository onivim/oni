/**
 * Commands.ts
 *
 * Implementation of command registration / callback for plugins
 */

import { IPluginChannel } from "./Channel"

import * as Log from "./../../Log"

type ICommandCallback = (args?: any) => void

/**
 * API instance for interacting with Oni (and vim)
 */
export class Commands {
    private _commandToCallback: { [command: string]: ICommandCallback } = { }

    constructor(private _channel: IPluginChannel) { }

    public registerCommand(commandName: string, callback: ICommandCallback): void {
        this._commandToCallback[commandName] = callback
    }

    public onCommand(commandName: string, args?: any) {
         const command = this._commandToCallback[commandName]

         if (!command) {
            Log.warn(`No command registered: ${commandName}`)
            return
         }

         command(args)
    }

    public executeCommand(commandName: string, args?: any) {
        this._channel.send("execute-command", null, {
            commandName,
            args,
        })
    }
}
