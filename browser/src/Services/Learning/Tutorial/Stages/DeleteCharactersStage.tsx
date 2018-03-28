/**
 * DeleteCharactersStage.tsx
 *
 * Stage that visualizes characters that need to be deleted
 */

import * as Oni from "oni-api"
import * as React from "react"

import * as types from "vscode-languageserver-types"

import styled from "styled-components"

import { ITutorialContext, ITutorialStage } from "./../ITutorial"

const DeleteCharacterWrapper = styled.div`
    background-color: red;
    color: white;
    position: absolute;
    opacity: 0.2;
`

// const OverlayWrapper = styled.div`
//     position: absolute;
//     top: 0px;
//     left: 0px;
//     right: 0px;
//     bottom: 0px;
// `

export class DeleteCharactersStage implements ITutorialStage {
    public get goalName(): string {
        return this._goalName
    }

    constructor(
        private _goalName: string,
        private _line: number,
        private _startPosition: number,
        private _charactersToDelete: string,
    ) {}

    public async tickFunction(context: ITutorialContext): Promise<boolean> {
        // NOTE: This stage is purely for rendering
        return true
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        const screenPosition = context.bufferToScreen(
            types.Position.create(this._line, this._startPosition),
        )
        const pixelPosition = context.screenToPixel(screenPosition)

        if (pixelPosition.pixelX < 0 || pixelPosition.pixelY < 0) {
            return null
        }

        const width = (context as any).fontPixelWidth
        const height = (context as any).fontPixelHeight

        return (
            <DeleteCharacterWrapper
                style={{
                    left: pixelPosition.pixelX + "px",
                    top: pixelPosition.pixelY + "px",
                    width: this._charactersToDelete.length * width + "px",
                    height: height + "px",
                }}
            />
        )
    }
}
