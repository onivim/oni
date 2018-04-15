/**
 * WaitForModeStage
 *
 * Stage that just waits for a mode to complete
 */

import * as Oni from "oni-api"

import { ITutorialContext, ITutorialStage } from "./../ITutorial"

export class WaitForModeStage implements ITutorialStage {
    public get goalName(): string {
        return this._goalName
    }

    constructor(private _goalName: string, private _mode: string) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        return context.editor.mode === this._mode
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return null
    }
}
