/**
 * SetCursorPositionStage.tsx
 */

import { ITutorialContext, ITutorialStage } from "./../ITutorial"

export class SetCursorPositionStage implements ITutorialStage {
    public get goalName(): string {
        return null
    }

    constructor(private _line: number = 0, private _column: number = 0) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        await context.buffer.setCursorPosition(this._line, this._column)
        return true
    }

    public render(): JSX.Element {
        return null
    }
}
