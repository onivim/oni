/**
 * TutorialManager
 */

import * as React from "react"
import * as Oni from "oni-api"

import * as types from "vscode-languageserver-types"

import styled, { keyframes } from "styled-components"

import { ITutorial, ITutorialContext, ITutorialStage } from "./ITutorial"
import { ITutorialMetadata } from "./TutorialManager"

export class SwitchModeTutorial implements ITutorial {
    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorial.switch_modes",
            name: "Switching Modes",
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

const SpinnerKeyFrames = keyframes`
    0% {transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
`

const LoadingSpinnerWrapper = styled.div`
    animation: ${SpinnerKeyFrames} 2s linear infinite;
    border-top: 12px solid white;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid transparent;
    opacity: 0.8;
`

export class BasicMovementTutorial implements ITutorial {
    public get metadata(): ITutorialMetadata {
        return {
            id: "basic_movement",
            name: "h, j, k, l movement",
        }
    }

    public get stages(): ITutorialStage[] {
        const randomPosition = () => Math.round(Math.random() * 10)
        return [
            new InitializeBufferStage(),
            new MoveToGoalStage("Use 'l' to move to the goal", 0, 8),
            new MoveToGoalStage("Use 'j' to move to the goal", 8, 8),
            new MoveToGoalStage("Use 'h' to move to the goal", 8, 1),
            new MoveToGoalStage("Use 'k' to move to the goal", 1, 1),
            new MoveToGoalStage(
                "Use h/j/k/l to move to the goal",
                randomPosition(),
                randomPosition(),
            ),
            new MoveToGoalStage(
                "Use h/j/k/l to move to the goal",
                randomPosition(),
                randomPosition(),
            ),
        ]
    }
}

export class MoveToGoalStage implements ITutorialStage {
    public get goalName(): string {
        return this._goalName
    }

    constructor(private _goalName: string, private _line: number, private _column: number) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        return (
            context.buffer.cursor.line === this._line &&
            context.buffer.cursor.column === this._column
        )
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        // const anyContext = context as any
        const screenPosition = context.bufferToScreen(
            types.Position.create(this._line, this._column),
        )
        const pixelPosition = context.screenToPixel(screenPosition)

        return (
            <LoadingSpinnerWrapper
                style={{
                    position: "absolute",
                    top: pixelPosition.pixelY.toString() + "px",
                    left: pixelPosition.pixelX.toString() + "px",
                }}
            />
        )
    }
}

export class InitializeBufferStage implements ITutorialStage {
    public get goalName(): string {
        return null
    }

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        await context.editor.neovim.command(":set listchars=space:·,precedes:·,trail:·")
        await context.editor.neovim.command(":set list!")
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

        await context.buffer.setCursorPosition(0, 0)

        return true
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return null
    }
}
