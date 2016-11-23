/**
 * QuickOpen.ts
 *
 * Manages the quick open menu
 */

import { INeovimInstance } from "./../NeovimInstance"
import { BufferInfo, PluginManager } from "./../Plugins/PluginManager"

import * as _ from "lodash"

export class Formatter {

    private _neovimInstance: INeovimInstance
    private _pluginManager: PluginManager

    private _bufferInfoAtRequest: BufferInfo

    constructor(neovimInstance: INeovimInstance, pluginManager: PluginManager) {
        this._neovimInstance = neovimInstance
        this._pluginManager = pluginManager

        this._pluginManager.on("format", (response: Oni.Plugin.FormattingEditsResponse) => {

            if(response.version != this._bufferInfoAtRequest.version)
                return

            const outputBuffer = [].concat(this._bufferInfoAtRequest.lines)

            const sortedEdits = _.orderBy(response.edits, [e => e.start.line, e => e.start.column], ["asc", "desc"])

            sortedEdits.forEach((edit) => {

                if(edit.start.line !== edit.end.line) {
                    console.warn("Unable to apply multi-line edit")
                    return
                }

                const line = edit.start.line
                outputBuffer[line - 1] = applyEdit(outputBuffer[line - 1], edit.start.column - 1, edit.end.column - 1, edit.newValue)
            })

            debugger

        })
    }

    public formatBuffer(): void {
        this._bufferInfoAtRequest = this._pluginManager.currentBuffer

        this._pluginManager.requestFormat()
    }

}


export function applyEdit(line: string, start: number, end: number, newText: string): string {
    const startString = line.substr(0, start)
    const endString = line.substr(end, line.length - end)

    return startString + newText + endString
}
