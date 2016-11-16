import * as Sender from "./Sender"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Diagnostics implements Oni.Plugin.Diagnostics.Api { 

    public setErrors(key: string, fileName: string, errors: Oni.Plugin.Diagnostics.Error[], color?: string): void {
        Sender.send("set-errors", {
            key: key,
            fileName: fileName,
            errors: errors,
            color: color
        })
    }

    public clearErrors(key: string): void {
        Sender.send("clear-errors", {
            key: key
        })
    }
}

