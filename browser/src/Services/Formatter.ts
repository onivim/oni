/**
 * QuickOpen.ts
 *
 * Manages the quick open menu
 */

import * as _ from "lodash"
import * as Config from "./../Config"
import { INeovimInstance } from "./../NeovimInstance"
import { PluginManager } from "./../Plugins/PluginManager"

import { BufferUpdates } from "./BufferUpdates"

export class Formatter {

    private _config = Config.instance()
    private _lastMode: string

    constructor(
        private _neovimInstance: INeovimInstance,
        private _pluginManager: PluginManager,
        private _bufferUpdates: BufferUpdates,
    ) {
        this._neovimInstance.on("mode-change", (newMode: string) => {
            if (this._config.getValue<boolean>("editor.formatting.formatOnSwitchToNormalMode")
                && newMode === "normal"
                && this._lastMode === "insert") {
                this.formatBuffer()
            }
            this._lastMode = newMode
        })

        this._pluginManager.on("format", (response: Oni.Plugin.FormattingEditsResponse) => {

            if (response.version !== this._bufferUpdates.version) {
                return
            }

            const outputBuffer = this._bufferUpdates.lines

            // Edits can affect the position of other edits... For example, if we remove a character at column 2,
            // another edit referenced at column 8 would now apply at column 7.
            // Long-term, there needs to be a strategy to map / re-map edits, but for now,
            // this can be worked around by sorting the edits in reverse - applying later column edits first
            const sortedEdits = _.orderBy(response.edits, [(e) => e.start.line, (e) => e.start.column], ["asc", "desc"])

            sortedEdits.forEach((edit) => {

                if (edit.start.line !== edit.end.line) {
                    console.warn("Unable to apply multi-line edit")
                    return
                }

                const line = edit.start.line
                outputBuffer[line - 1] = applyEdit(outputBuffer[line - 1], edit.start.column - 1, edit.end.column - 1, edit.newValue)
            })

            this._neovimInstance.getCurrentBuffer()
                .then((buffer) => buffer.setLines(0, outputBuffer.length, false, outputBuffer))

        })
    }

    public formatBuffer(): void {
        this._pluginManager.requestFormat()
    }

}

export function applyEdit(line: string, start: number, end: number, newText: string): string {
    const startString = line.substr(0, start)
    const endString = line.substr(end, line.length - end)

    return startString + newText + endString
}
