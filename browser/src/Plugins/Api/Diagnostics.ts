/**
 * Diagnostics.ts
 *
 * API surface exposed for interacting with error management in plugins
 */

import { IPluginChannel } from "./Channel"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Diagnostics implements Oni.Plugin.Diagnostics.Api {
    private _filesThatHaveErrors: { [fileName: string]: boolean } = {}

    constructor(private _channel: IPluginChannel) {
    }

    public setErrors(key: string, fileName: string, errors: Oni.Plugin.Diagnostics.Error[], color?: string): void {

        if (!errors) {
            return
        }

        if (errors.length === 0 && !this._filesThatHaveErrors[fileName]) {
            return
        }

        this._filesThatHaveErrors[fileName] = errors.length > 0

        this._channel.send("set-errors", null, {
            key,
            fileName,
            errors,
            color,
        })
    }

    public clearErrors(key: string): void {
        this._filesThatHaveErrors = {}
        this._channel.send("clear-errors", null, {
            key,
        })
    }
}
