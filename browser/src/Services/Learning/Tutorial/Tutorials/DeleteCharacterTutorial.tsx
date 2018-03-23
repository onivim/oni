/**
 * TutorialManager
 */

import { ITutorial, ITutorialContext, ITutorialMetadata, ITutorialStage } from "./../ITutorial"
import * as Stages from "./../Stages"

export class DeleteCharacterTutorial implements ITutorial {
    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorial.delete_character",
            name: "Normal Mode: Deleting a Character",
            description: "You can use the `x` key to delete a character under the cursor.",
            level: 120,
        }
    }

    public get stages(): ITutorialStage[] {
        return [
            new Stages.SetBufferStage(["The ccow jumpedd ovverr thhe moon.."]),
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
