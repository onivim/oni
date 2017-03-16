/**
 * AutoCompletion.ts
 *
 * Manages the autocompletion service:
 *  - Integrating with Neovim's external popup menu
 *  - Managing completion state
 */

import { INeovimInstance } from "./../NeovimInstance"
import { IBuffer } from "./../neovim/Buffer"
import * as Utility from "./AutoCompletionUtility"

import * as UI from "./../UI/index"

export class AutoCompletion {

    constructor(
        private _neovimInstance: INeovimInstance,
    ) {
        this._neovimInstance.on("show-popup-menu", (completions: any[]) => {
            const c = completions.map((completion) => ({
                kind: "text",
                label: completion[0],
            }))

            UI.showCompletions({
                base: "",
                completions: c,
            })
        })
    }

    public complete(): void {
        let cursorRow: number
        let cursorColumn: number
        let originalLineLength: number
        let newLineLength: number

        let completion = UI.getSelectedCompletion() || ""
        let currentBuffer: IBuffer
        this._neovimInstance.getCurrentBuffer()
            .then((buffer) => currentBuffer = buffer)

            .then(() => this._neovimInstance.getCursorColumn())
            .then((col) => cursorColumn = col)

            .then(() => this._neovimInstance.getCursorRow())
            .then((row) => cursorRow = row)

            .then(() => {
                return currentBuffer.getLines(cursorRow - 1, cursorRow, false)
            })
            .then((value) => {
                const line = value[0]
                originalLineLength =line.length
                const newLine = Utility.replacePrefixWithCompletion(line, cursorColumn - 2, completion)
                newLineLength = newLine.length
                console.log(newLine)
                return currentBuffer.setLines(cursorRow - 1, cursorRow, false, [newLine])
            })
            .then(() => {
                const cursorOffset = newLineLength - originalLineLength
                return this._neovimInstance.eval(`setpos(".", [0, ${cursorRow}, ${cursorColumn + cursorOffset} + 2, 0])`)
            })

        UI.hideCompletions()
    }
}
