/**
 * TutorialManager
 */

import { ITutorial, ITutorialContext, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Stages from "./../Stages"

export class SwitchModeTutorial implements ITutorial {
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
        return [
            new Stages.ClearBufferStage(),
            {
                goalName: "Switch to insert mode by pressing 'i'",
                tickFunction: async (context: ITutorialContext): Promise<boolean> => {
                    return context.editor.mode === "insert"
                },
            },
            {
                goalName: "Type some text!",
                tickFunction: async (context: ITutorialContext): Promise<boolean> => {
                    const [line] = await context.buffer.getLines(
                        context.buffer.cursor.line,
                        context.buffer.cursor.line + 1,
                    )

                    return line && line.length > 3
                },
            },
            {
                goalName: "Switch back to normal mode by pressing 'esc'",
                tickFunction: async (context: ITutorialContext): Promise<boolean> => {
                    return context.editor.mode === "normal"
                },
            },
            {
                goalName: "Switch to insert mode on a new line by pressing 'o'",
                tickFunction: async (context: ITutorialContext): Promise<boolean> => {
                    return context.editor.mode === "insert" && context.buffer.cursor.line === 1
                },
            },
            {
                goalName: "Type some more text!",
                tickFunction: async (context: ITutorialContext): Promise<boolean> => {
                    const [line] = await context.buffer.getLines(
                        context.buffer.cursor.line,
                        context.buffer.cursor.line + 1,
                    )

                    return line && line.length > 3
                },
            },
            {
                goalName: "Switch back to normal mode by pressing 'esc'",
                tickFunction: async (context: ITutorialContext): Promise<boolean> => {
                    return context.editor.mode === "normal"
                },
            },
        ]
    }
}
