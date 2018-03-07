/**
 * Definition.tsx
 *
 * UX for when the 'go-to definition' gesture is available
 */

import * as React from "react"
import * as types from "vscode-languageserver-types"

import styled, { keyframes } from "styled-components"

import * as Oni from "oni-api"

const DefinitionAppearKeyFrames = keyframes`
    from {opacity: 0; transform: translateY(2px);}
    to {opacity: 0.4; transform: translateY(0px);}
`

const StyledDefinition = styled.div`
    animation-name: ${DefinitionAppearKeyFrames};
    animation-duration: 0.25s;
    animation-delay: 0.25s;
    animation-fill-mode: forwards;
    animation-timing-function: ease-in;
    opacity: 0;
`

export interface IDefinitionProps {
    range: types.Range
    fontWidthInPixels: number
    fontHeightInPixels: number

    color: string

    bufferToScreen: Oni.Coordinates.BufferToScreen
    screenToPixel: Oni.Coordinates.ScreenToPixel
}

export class Definition extends React.PureComponent<IDefinitionProps, {}> {
    public render(): JSX.Element {
        if (!this.props.range || !this.props.bufferToScreen) {
            return null
        }

        const startScreenPosition = this.props.bufferToScreen(this.props.range.start)
        const endScreenPosition = this.props.bufferToScreen(this.props.range.end)

        if (!startScreenPosition || !endScreenPosition) {
            return null
        }

        // TODO: If a range spans multiple lines, break up into multiple screen ranges
        if (startScreenPosition.screenY !== endScreenPosition.screenY) {
            return null
        }

        const startPixelPosition = this.props.screenToPixel(startScreenPosition)
        const endPixelPosition = this.props.screenToPixel(endScreenPosition)

        const style: React.CSSProperties = {
            position: "absolute",
            top: startPixelPosition.pixelY + "px",
            left: startPixelPosition.pixelX + "px",
            height: this.props.fontHeightInPixels + "px",
            width:
                endPixelPosition.pixelX -
                startPixelPosition.pixelX +
                this.props.fontWidthInPixels +
                "px",
            borderBottom: "1px solid " + this.props.color,
        }

        return <StyledDefinition style={style} />
    }
}
