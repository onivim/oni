/**
 * FadeInLineStage.tsx
 *
 * Stage that visualizes characters that need to be deleted
 */

import * as Oni from "oni-api"
import * as React from "react"

import * as types from "vscode-languageserver-types"

import styled, { keyframes } from "styled-components"

import { configuration } from "./../../../Configuration"

import { ITutorialContext, ITutorialStage } from "./../ITutorial"

import { withProps } from "./../../../../UI/components/common"

const FuzzyFadeInKeyframes = keyframes`
    0% { opacity: 0; -webkit-filter: blur(10px); }
    100% { opacity: 1; }
`
const Wrapper = withProps<{}>(styled.div)`
    background-color: ${props => props.theme["editor.background"]};
    color: ${props => props.theme["editor.foreground"]};
    position: absolute;
`

const FadeInWrapper = styled.div`
    animation: ${FuzzyFadeInKeyframes} 0.4s linear forwards;

    opacity: 0;
`
export class FadeInLineStage implements ITutorialStage {
    private _fontFamily: string
    private _fontSize: string

    public get goalName(): string {
        return this._goalName
    }

    constructor(private _goalName: string, private _line: number, private _characters: string) {
        this._fontFamily = configuration.getValue("editor.fontFamily")
        this._fontSize = configuration.getValue("editor.fontSize")
    }

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        // NOTE: This stage is purely for rendering
        return new Promise<boolean>(resolve => {
            window.setTimeout(() => {
                resolve(true)
            }, 300)
        })
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        const screenPosition = context.bufferToScreen(types.Position.create(0, 0))
        const pixelPosition = context.screenToPixel(screenPosition)

        if (pixelPosition.pixelX < 0 || pixelPosition.pixelY < 0) {
            return null
        }

        const height = (context as any).fontPixelHeight

        return (
            <Wrapper
                style={{
                    left: pixelPosition.pixelX + "px",
                    top: height * this._line + "px",
                    height: height + "px",
                    lineHeight: height + "px",
                    fontFamily: this._fontFamily,
                    fontSize: this._fontSize,
                }}
            >
                <FadeInWrapper>{this._characters}</FadeInWrapper>
            </Wrapper>
        )
    }
}
