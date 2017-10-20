/**
 * Definition.tsx
 *
 * UX for when the 'go-to definition' gesture is available
 */

import * as React from "react"
import * as types from "vscode-languageserver-types"

import { BufferToScreen, ScreenToPixel } from "./../Coordinates"

require("./Definition.less") // tslint:disable-line no-var-requires

export interface IDefinitionProps {
    range: types.Range
    fontWidthInPixels: number
    fontHeightInPixels: number

    color: string

    bufferToScreen: BufferToScreen
    screenToPixel: ScreenToPixel
}

export class Definition extends React.PureComponent<IDefinitionProps, void> {
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
            width: (endPixelPosition.pixelX - startPixelPosition.pixelX + this.props.fontWidthInPixels) + "px",
            borderBottom: "1px solid " + this.props.color,
        }

        return <div className="definition" style={style} />
    }
}
