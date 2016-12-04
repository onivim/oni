/**
 * QuickInfo.ts
 *
 * Show QuickInfo (or error) as cursor moves in normal mode
 */
import {TypeScriptServerHost} from "./TypeScriptServerHost"

export class QuickInfo {
    private _host: TypeScriptServerHost
    private _oni: any

    constructor(oni: any, host: TypeScriptServerHost) {
        this._oni = oni
        this._host = host
        // this._errorManager = errorManager;
    }

    public showQuickInfo(fullBufferPath: string, line: number, col: number): void {
        this._host.getQuickInfo(fullBufferPath, line, col).then((val: any) => {
            console.log("Quick info: " + JSON.stringify(val)) // tslint:disable-line no-console

            // Truncate display string if over 100 characters

            this._oni.showQuickInfo(val.displayString, val.documentation)
        })
    }
}
