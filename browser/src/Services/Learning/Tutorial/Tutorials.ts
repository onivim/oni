/**
 * TutorialManager
 */

import * as Oni from "oni-api"

import { ITutorial, ITutorialContext, ITutorialStage, ITutorialMetadata } from "./ITutorial"

export class SwitchModeTutorial implements ITutorial {
    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorial.switch_modes",
            name: "Switching Modes",
            level: 110,
        }
    }

    public get stages(): ITutorialStage[] {
        return [
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
                goalName: "Switch back to normal mode pressing 'esc'",
                tickFunction: async (context: ITutorialContext): Promise<boolean> => {
                    return context.editor.mode === "normal"
                },
            },
        ]
    }
}

export class BasicMovementTutorial implements ITutorial {
    private _idx: number = 0

    public get metadata(): ITutorialMetadata {
        return {
            id: "basic_movement",
            name: "h, j, k, l movement",
            level: 100,
        }
    }

    public get stages(): ITutorialStage[] {
        return [
            {
                goalName: "Init",
                tickFunction: async (context: ITutorialContext): Promise<boolean> => {
                    await context.buffer.setLines(0, 9, [
                        "                    ",
                        "                    ",
                        "                    ",
                        "                    ",
                        "                    ",
                        "                    ",
                        "                    ",
                        "                    ",
                        "                    ",
                        "                    ",
                    ])

                    return true
                },
                render: (context: Oni.BufferLayerRenderContext) => {
                    return null
                },
            },
            {
                goalName: "Testing",
                tickFunction: async (tutorialContext: ITutorialContext): Promise<boolean> => {
                    this._idx = this._idx || 0
                    this._idx++
                    return false
                },
                render: (context: Oni.BufferLayerRenderContext) => {
                    return null
                },
            },
        ]
    }
}

export const AllTutorials: ITutorial[] = [new SwitchModeTutorial(), new BasicMovementTutorial()]
