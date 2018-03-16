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
            name: "Switching Modes: Insert and Normal",
            description:
                "Oni is a modal editor, which means the editor works in different modes. This can seem strange coming from other editors - where the only mode is inserting text. However, when working with text, you'll find that only a small percentage of the time you are typing - the majority of the time, you are navigating and editing, which is where normal mode is used. Let's practice switching to and from insert mode!",
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
    private _positions: number[] = []

    constructor() {
        const randomPosition = () => Math.round(Math.random() * 10)
        this._positions = [
            randomPosition(),
            randomPosition(),
            randomPosition(),
            randomPosition(),
            randomPosition(),
            randomPosition(),
        ]
    }

    public get metadata(): ITutorialMetadata {
        return {
            id: "oni.tutorials.basic_movement",
            name: "Normal Mode Motion: h/j/k/l",
            description:
                "To use Oni effectively in normal mode, you'll need to learn to move the cursor around! There are many ways to move the cursor, but the most basic is to use `h`, `j`, `k`, and `l`. These keys might seem strange at first, but they allow you to move the cursor without your fingers leaving the home row.",
        }
    }

    public get stages(): ITutorialStage[] {
        return [
            new InitializeBufferStage(),
            new MoveToGoalStage("Use 'l' to move right to the goal", 0, 8),
            new MoveToGoalStage("Use 'j' to move down to the goal", 8, 8),
            new MoveToGoalStage("Use 'h' to move up to the goal", 8, 1),
            new MoveToGoalStage("Use 'k' to move right to the goal", 1, 1),
            new MoveToGoalStage(
                "Put it together! Use h/j/k/l to move to the goal",
                this._positions[0],
                this._positions[1],
            ),
            new MoveToGoalStage(
                "Do it again! Use h/j/k/l to move to the goal",
                this._positions[2],
                this._positions[3],
            ),
            new MoveToGoalStage(
                "One last time... Use h/j/k/l to move to the goal",
                this._positions[4],
                this._positions[5],
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
