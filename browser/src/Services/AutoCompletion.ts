/**
 * AutoCompletion.ts
 *
 * Manages the autocompletion service:
 *  - Integrating with Neovim's external popup menu
 *  - Managing completion state
 */

import * as types from "vscode-languageserver-types"

import { IBuffer, INeovimInstance } from "./../neovim"

import * as Utility from "./AutoCompletionUtility"

import * as UI from "./../UI/index"

export class AutoCompletion {

    constructor(
        private _neovimInstance: INeovimInstance,
    ) {
        this._neovimInstance.on("show-popup-menu", (completions: any[]) => {
            const c = completions.map((completion) => ({
                kind: types.CompletionItemKind.Text,
                label: completion[0],
            }))

            UI.Actions.showCompletions({
                base: "",
                completions: c,
            })
        })

        this._neovimInstance.on("hide-popup-menu", () => {
            UI.Actions.hideCompletions()
        })
    }

    public complete(): void {
        let cursorRow: number
        let cursorColumn: number
        let originalLineLength: number
        let newLineLength: number

        let completion = UI.Selectors.getSelectedCompletion() || ""
        let currentBuffer: IBuffer
        this._neovimInstance.getCurrentBuffer()
            .then((buffer) => currentBuffer = buffer)

            // Get position in buffer
            .then(() => this._neovimInstance.getCursorColumn())
            .then((col) => cursorColumn = col)

            .then(() => this._neovimInstance.getCursorRow())
            .then((row) => cursorRow = row)

            // Get current line
            .then(() => {
                return currentBuffer.getLines(cursorRow - 1, cursorRow, false)
            })
            // Replace with completion value
            .then((value) => {
                const line = value[0]
                originalLineLength = line.length
                const newLine = Utility.replacePrefixWithCompletion(line, cursorColumn - 2, completion)
                newLineLength = newLine.length
                return currentBuffer.setLines(cursorRow - 1, cursorRow, false, [newLine])
            })
            .then(() => {
                const cursorOffset = newLineLength - originalLineLength

                // Set cursor position after the word
                return this._neovimInstance.eval(`setpos(".", [0, ${cursorRow}, ${cursorColumn + cursorOffset}, 0])`)
            })

        UI.Actions.hideCompletions()
    }
}
