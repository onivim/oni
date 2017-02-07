import * as Sender from "./Sender"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Diagnostics implements Oni.Plugin.Diagnostics.Api { 

    constructor(private _sender: Sender.ISender = new Sender.IpcSender) {
    }

    public setErrors(key: string, fileName: string, errors: Oni.Plugin.Diagnostics.Error[], color?: string): void {
        this._sender.send("set-errors", null, {
            key: key,
            fileName: fileName,
            errors: errors,
            color: color
        })
    }

    public clearErrors(key: string): void {
        this._sender.send("clear-errors", null, {
            key: key
        })
    }
}

