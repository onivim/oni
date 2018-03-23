/**
 * TutorialManager
 */

import * as Oni from "oni-api"
import * as React from "react"

import * as types from "vscode-languageserver-types"

import styled, { keyframes } from "styled-components"

import { ITutorialStage } from "./../ITutorial"

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
export class MoveToGoalStage implements ITutorialStage {
    public get goalName(): string {
        return this._goalName
    }

    constructor(private _goalName: string, private _line: number, private _column: number) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        const cursorPosition = await (context.buffer as any).getCursorPosition()
        return cursorPosition.line === this._line && cursorPosition.character === this._column
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
                    marginTop: "2px",
                    marginLeft: "-4px",
                }}
            />
        )
    }
}
