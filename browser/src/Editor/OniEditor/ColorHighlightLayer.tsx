import * as Oni from "oni-api"
import * as React from "react"

import styled, { pixel, withProps } from "../../UI/components/common"

interface IProps {
    top: number
    left: number
    height: number
}

const ColorHighlight = withProps<IProps>(styled.span).attrs({
    style: (props: IProps) => ({
        top: pixel(props.top),
        left: pixel(props.left),
        height: pixel(props.height),
    }),
})`
  position: absolute;
`

export default class ColorHighlightLayer implements Oni.BufferLayer {
    // private _colorRegex = /^(rgb|hsl)a?\((\d+%?(deg|rad|grad|turn)?[,\s]+){2,3}[\s\/]*[\d\.]+%?\)$/i
    private _colorRegex = /^#(?:[0-9a-f]{3}){1,2}$/i
    public get id() {
        return "color-highlight"
    }

    public render(context: Oni.BufferLayerRenderContext) {
        return <>{this._getColorHighlights(context)}</>
    }

    private _getColorHighlights = (context: Oni.BufferLayerRenderContext) => {
        return context.visibleLines.map(line => {
            const color = this._colorRegex.exec(line)
            console.log("regexDetails: ", color)
            return color && <ColorHighlight top={20} left={20} height={20} />
        })
    }
}
