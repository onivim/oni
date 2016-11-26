/**
 * LiveEvaluation.ts
 */

import * as os from "os"

import { INeovimInstance } from "./../NeovimInstance"
import { BufferInfo, PluginManager } from "./../Plugins/PluginManager"

/**
 * Implementation of the LiveEvaluation service
 */
export class LiveEvaluation {

    private _neovimInstance: INeovimInstance
    private _pluginManager: PluginManager

    constructor(neovimInstance: INeovimInstance, pluginManager: PluginManager) {
        this._neovimInstance = neovimInstance
        this._pluginManager = pluginManager

        this._pluginManager.on("evaluate-block-result", (res) => {
            alert(JSON.stringify(res))
        })
    }

    public evaluateBlock(): void {

        let selectionRange = null

        this._neovimInstance.getSelectionRange()
            .then((s) => selectionRange = s)
            .then(() => this._neovimInstance.getCurrentBuffer())
            .then((b) => b.getLines(selectionRange.start.line - 1, selectionRange.end.line, false))
            .then((lines: string[]) => {
                console.log(selectionRange)
                const code = lines.join(os.EOL)
                this._pluginManager.requestEvaluateBlock(code)
            })
    }
}
