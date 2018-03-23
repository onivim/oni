/**
 * ClearBufferStage
 */

import { ITutorialContext, ITutorialStage } from "./../ITutorial"

export class SetBufferStage implements ITutorialStage {
    public get goalName(): string {
        return null
    }

    constructor(private _lines: string[]) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        const allLines = context.buffer.lineCount
        await context.buffer.setLines(0, allLines, this._lines)
        return true
    }

    public render(): JSX.Element {
        return null
    }
}

export class ClearBufferStage extends SetBufferStage {
    constructor() {
        super([])
    }
}
