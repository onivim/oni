import * as Sender from "./Sender"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Editor implements Oni.Editor { 

    constructor(private _sender: Sender.ISender) {
    }

    public executeShellCommand(shellCommand: string) {
        this._sender.send("execute-shell-command", null, {
            command: shellCommand
        })
    }
}

