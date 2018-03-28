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

const TopArrow = styled.div`
    animation: ${SpinnerKeyFrames} 2s linear infinite;
    border-top: 6px solid red;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    border-bottom: 3px solid transparent;
    opacity: 0.8;
`

const BottomArrow = styled.div`
    animation: ${SpinnerKeyFrames} 2s linear infinite;
    margin-top: 2px;
    border-top: 3px solid transparent;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    border-bottom: 6px solid red;
    opacity: 0.8;
`

const getFirstCharacterThatIsDifferent = (line1: string, line2: string): number => {
    if (!line1 || !line2) {
        return -1
    }

    let idx = 0

    while (idx < line1.length && idx < line2.length) {
        if (line1[idx] !== line2[idx]) {
            return idx
        }

        idx++
    }
    return idx
}

export class CorrectLineStage implements ITutorialStage {
    private _diffPosition: number

    public get goalName(): string {
        return this._goalName
    }

    constructor(
        private _goalName: string,
        private _line: number,
        private _expectedText: string,
        private _minimumCorrectLine: string,
    ) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        const [currentLine] = await (context.buffer as any).getLines(this._line, this._line + 1)
        const diffPosition = getFirstCharacterThatIsDifferent(currentLine, this._expectedText)
        this._diffPosition = diffPosition

        if (currentLine.startsWith(this._minimumCorrectLine)) {
            return true
        }

        return false
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        // const anyContext = context as any
        const screenPosition = context.bufferToScreen(
            types.Position.create(this._line, this._diffPosition),
        )

        const pixelPosition = context.screenToPixel(screenPosition)

        if (pixelPosition.pixelX < 0 || pixelPosition.pixelY < 0) {
            return null
        }

        return (
            <div
                style={{
                    position: "absolute",
                    top: pixelPosition.pixelY.toString() + "px",
                    left: pixelPosition.pixelX.toString() + "px",
                }}
            >
                <TopArrow />
                <BottomArrow />
            </div>
        )
    }
}
