/**
 * CorrectLineStage.tsx
 *
 *
 */

import * as Oni from "oni-api"
import * as React from "react"

import * as types from "vscode-languageserver-types"

import styled, { keyframes } from "styled-components"

import { ITutorialContext, ITutorialStage } from "./../ITutorial"

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

export class GoToLineStage implements ITutorialStage {
    public get goalName(): string {
        return this._goalName
    }

    constructor(private _goalName: string, private _line: number) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        const cursor
        const [currentLine] = await (context.buffer as any).getLines(this._line, this._line + 1)
        const diffPosition = getFirstCharacterThatIsDifferent(currentLine, this._expectedText)
        this._diffPosition = diffPosition

        if (diffPosition < 0 || diffPosition >= currentLine.length) {
            return true
        }

        const diffCharacter = currentLine[diffPosition]

        return diffCharacter !== this._characterToDelete
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        // const anyContext = context as any
        const screenPosition = context.bufferToScreen(
            types.Position.create(this._line, this._diffPosition),
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
