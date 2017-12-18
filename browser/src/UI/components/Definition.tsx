/**
 * Definition.tsx
 *
 * UX for when the 'go-to definition' gesture is available
 */

import * as React from "react"
import * as types from "vscode-languageserver-types"

import styled, { keyframes } from "styled-components"

import { BufferToScreen, ScreenToPixel } from "./../Coordinates"

export interface IDefinitionProps {
    range: types.Range
    fontWidthInPixels: number
    fontHeightInPixels: number

    color: string

    bufferToScreen: BufferToScreen
    screenToPixel: ScreenToPixel
}

const appear = keyframes`
    from { opacity: 0; transform: translateY(2px); }
    to { opacity: 0.4; transform: translateY(0px); }
    `

export const Definition = (props: IDefinitionProps) => {
    if (!props.range || !props.bufferToScreen) {
        return null
    }

    const startScreenPosition = props.bufferToScreen(props.range.start)
    const endScreenPosition = props.bufferToScreen(props.range.end)

    if (!startScreenPosition || !endScreenPosition) {
        return null
    }

    // TODO: If a range spans multiple lines, break up into multiple screen ranges
    if (startScreenPosition.screenY !== endScreenPosition.screenY) {
        return null
    }

    const startPixelPosition = props.screenToPixel(startScreenPosition)
    const endPixelPosition = props.screenToPixel(endScreenPosition)

    const Underline = styled.div`
        position: absolute;
        top: ${startPixelPosition.pixelY}px;
        left: ${startPixelPosition.pixelX}px;
        height: ${props.fontHeightInPixels}px;
        width: ${endPixelPosition.pixelX - startPixelPosition.pixelX + props.fontWidthInPixels}px;
        border-bottom: 1px solid ${props.color};

        animation-name: ${appear};
        animation-duration: 0.25s;
        animation-delay: 0.25s;
        animation-fill-mode: forwards;
        animation-timing-function: ease-in;
        opacity: 0;
        `

    return <Underline />
}

