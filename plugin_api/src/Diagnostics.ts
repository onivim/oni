import * as Sender from "./Sender"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Diagnostics implements Oni.Plugin.Diagnostics.Api {
    private _filesThatHaveErrors: { [fileName: string]: boolean } = {}

    constructor(private _sender: Sender.ISender = new Sender.IpcSender) {
    }

    public setErrors(key: string, fileName: string, errors: Oni.Plugin.Diagnostics.Error[], color?: string): void {

        if (!errors)
            return

        if (errors.length === 0 && !this._filesThatHaveErrors[fileName])
            return

        this._filesThatHaveErrors[fileName] = errors.length > 0

        this._sender.send("set-errors", null, {
            key: key,
            fileName: fileName,
            errors: errors,
            color: color
        })
    }

    public clearErrors(key: string): void {
        this._filesThatHaveErrors = {}
        this._sender.send("clear-errors", null, {
            key: key
        })
    }
}

