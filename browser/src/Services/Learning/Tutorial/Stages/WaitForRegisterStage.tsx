/**
 * SetRegisterStage.tsx
 *
 * Stage that waits for expected register contents
 */

import { ITutorialContext, ITutorialStage } from "./../ITutorial"

export class WaitForRegisterStage implements ITutorialStage {
    public get goalName(): string {
        return this._goal
    }

    constructor(
        private _goal: string,
        private _contents: string,
        private _register: string = '"',
    ) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        const contents = await context.editor.neovim.callFunction("getreg", [this._register])
        return contents === this._contents
    }

    public render(): JSX.Element {
        return null
    }
}
