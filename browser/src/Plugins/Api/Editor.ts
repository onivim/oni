import { IPluginChannel } from "./Channel"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Editor implements Oni.Editor {

    constructor(private _channel: IPluginChannel) {
    }

    public executeShellCommand(shellCommand: string) {
        this._channel.send("execute-shell-command", null, {
            command: shellCommand,
        })
    }
}
