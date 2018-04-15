/**
 * WaitForStateStage.tsx
 */

import * as Oni from "oni-api"

import { ITutorialContext, ITutorialStage } from "./../ITutorial"

export class WaitForStateStage implements ITutorialStage {
    public get goalName(): string {
        return this._goalName
    }

    constructor(private _goalName: string, private _lines: string[]) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        // return false

        const bufferLines = await context.buffer.getLines()

        if (bufferLines.length === this._lines.length) {
            return bufferLines.reduce((prev, curr, idx) => {
                return curr === this._lines[idx] && prev
            }, true)
        }

        return false

        // const cursorPosition = await (context.buffer as any).getCursorPosition()

        // this._goalColumn = this._column === null ? cursorPosition.character : this._column

        // return cursorPosition.line === this._line && cursorPosition.character === this._goalColumn
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return null
    }
}
