/**
 * TutorialManager
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

const MoveToCharacterWrapper = styled.div`
    background-color: rgba(255, 255, 255, 0.2);
    position: absolute;
    border-bottom: 1px solid rgba(255, 255, 255, 0.8);
`

const TopArrow = styled.div`
    animation: ${SpinnerKeyFrames} 2s linear infinite;
    border-top: 8px solid white;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid transparent;
    opacity: 0.8;
    margin-left: -3px;
    margin-top: 1px;
`

const EntranceKeyFrames = keyframes`
    0% { opacity: 0; }
    100% { opacity: 1; }
`

const CommonAnimation = `
    animation-name: ${EntranceKeyFrames};
    animation-duration: 0.4s;
    animation-delay: 0.25s;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    opacity: 0;
`

const MoveToTopWrapper = styled.div`
    ${CommonAnimation} position: absolute;
    top: 0px;
    left: 25%;
    right: 25%;
    height: 4em;
    background-color: rgba(0, 0, 0, 0.8);

    display: flex;
    justify-content: center;
    align-items: center;
`

const MoveToBottomWrapper = styled.div`
    ${CommonAnimation} position: absolute;
    bottom: 0px;
    left: 25%;
    right: 25%;
    height: 4em;
    background-color: rgba(0, 0, 0, 0.8);

    display: flex;
    justify-content: center;
    align-items: center;
`

export class MoveToGoalStage implements ITutorialStage {
    private _goalColumn: number
    private _currentCursorLine: number = 0
    public get goalName(): string {
        return this._goalName
    }

    constructor(private _goalName: string, private _line: number, private _column?: number) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        const cursorPosition = await (context.buffer as any).getCursorPosition()

        this._currentCursorLine = cursorPosition.line
        this._goalColumn = !!this._column ? this._column : cursorPosition.character

        return (
            cursorPosition.line === this._line &&
            (cursorPosition.character === this._goalColumn || typeof this._column !== "number")
        )
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        if (typeof this._goalColumn !== "number") {
            return null
        }

        const screenPosition = context.bufferToScreen(
            types.Position.create(this._line, this._goalColumn),
        )
        const pixelPosition = context.screenToPixel(screenPosition)

        if (isNaN(pixelPosition.pixelX) || isNaN(pixelPosition.pixelY)) {
            if (this._currentCursorLine > this._line) {
                return <MoveToTopWrapper>Move up to line: {this._line + 1}</MoveToTopWrapper>
            } else {
                return (
                    <MoveToBottomWrapper>Move down to line: {this._line + 1}</MoveToBottomWrapper>
                )
            }
        }

        const width = (context as any).fontPixelWidth
        const height = (context as any).fontPixelHeight

        return (
            <div
                style={{
                    position: "absolute",
                    top: pixelPosition.pixelY.toString() + "px",
                    left: pixelPosition.pixelX.toString() + "px",
                }}
            >
                <MoveToCharacterWrapper style={{ width: width + "px", height: height + "px" }} />
                <TopArrow />
            </div>
        )
    }
}
