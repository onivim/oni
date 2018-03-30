/**
 * TutorialManager
 */

import { ITutorial, ITutorialContext, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Stages from "./../Stages"

export class SwitchModeTutorial implements ITutorial {
    private _stages: ITutorialStage[]
    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorial.switch_modes",
            name: "Switching Modes",
            description:
                "Oni is a modal editor, which means the editor works in different modes. This can seem strange coming from other editors - where the only mode is inserting text. However, when working with text, you'll find that only a small percentage of the time you are typing - the majority of the time, you are navigating and editing, which is where normal mode is used. Let's practice switching to and from insert mode!",
            level: 100,
        }
    }

    public get stages(): ITutorialStage[] {
        return this._stages
    }

    constructor() {
        this._stages = [
            new Stages.ClearBufferStage(),
            new Stages.WaitForModeStage("Switch to INSERT mode by pressing 'i'", "insert"),
            new WaitForTextStage("Type some text!"),
            new Stages.WaitForModeStage("Switch back to NORMAL mode by pressing 'esc'", "normal"),
            {
                goalName: "Switch to insert mode on a new line by pressing 'o'",
                tickFunction: async (context: ITutorialContext): Promise<boolean> => {
                    return context.editor.mode === "insert" && context.buffer.cursor.line >= 1
                },
            },
            new WaitForTextStage("Type some more text!"),
            new Stages.WaitForModeStage("Switch back to NORMAL mode by pressing 'esc'", "normal"),
        ]
    }
}

export class WaitForTextStage implements ITutorialStage {
    private _characterCount: number = 0

    public get goalName(): string {
        return `${this._goalName} [${this._characterCount}/4 characters entered]`
    }

    constructor(private _goalName: string) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        const [line] = await context.buffer.getLines(
            context.buffer.cursor.line,
            context.buffer.cursor.line + 1,
        )

        this._characterCount = !!line ? line.length : 0

        return line && line.length > 3
    }
}
