/**
 * QuickOpen.ts
 *
 * Manages the quick open menu
 */

/**
 * AutoCompletion.ts
 *
 * Manages the autocompletion service:
 *  - Integrating with Neovim's external popup menu
 *  - Managing completion state
 */

import { INeovimInstance } from "./../NeovimInstance"
import { IBuffer } from "./../neovim/Buffer"
import { IScreen } from "./../Screen"

import * as UI from "./../UI/index"

export class AutoCompletion {

    constructor(
        private _neovimInstance: INeovimInstance,
        private _screen: IScreen
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
        // TODO: Replace row/col from screen with evals
        const { cursorRow, cursorColumn } = this._screen
        let completion = UI.getSelectedCompletion() || ""
        let currentBuffer: IBuffer
        this._neovimInstance.getCurrentBuffer()
            .then((buffer) => currentBuffer = buffer)
            .then(() => currentBuffer.getLines(cursorRow, cursorRow + 1, false))
            .then((value) => {
                const line = value[0]
                const newLine = replacePrefixWithCompletion(line, cursorColumn, completion)
                console.log(newLine)
                return currentBuffer.setLines(cursorRow, cursorRow + 1, false, [newLine])
            })

        UI.hideCompletions()
    }
}

export function getCompletionStart(bufferLine: string, cursorColumn: number, completion: string): number {

    let x = cursorColumn - 1
    while (x > 0) {
        const subWord = bufferLine.substring(x, cursorColumn)

        if (!completion.indexOf(subWord)) {
            break
        }

        x--
    }

    return x + 1
}

export function replacePrefixWithCompletion(bufferLine: string, cursorColumn: number, completion: string): string {
    const startPosition = getCompletionStart(bufferLine, cursorColumn, completion)

    const before = bufferLine.substring(0, startPosition)
    const after = bufferLine.substring(cursorColumn, bufferLine.length)

    return before + completion + after
}
