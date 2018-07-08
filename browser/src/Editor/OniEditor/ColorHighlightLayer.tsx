import * as memoize from "lodash/memoize"
import * as Oni from "oni-api"
import * as React from "react"

import styled, { pixel, withProps } from "../../UI/components/common"

interface IProps {
    top: number
    left: number
    height: number
    width: number
    color: string
}

const ColorHighlight = withProps<IProps>(styled.span).attrs({
    style: (props: IProps) => ({
        top: pixel(props.top),
        left: pixel(props.left),
        height: pixel(props.height),
        width: pixel(props.width),
    }),
})`
  opacity: 0.3;
  background-color: ${p => p.color};
  position: absolute;
`

export default class ColorHighlightLayer implements Oni.BufferLayer {
    public render = memoize((context: Oni.BufferLayerRenderContext) => {
        return <>{this._getColorHighlights(context)}</>
    })
    // Match hex/rgb/rgba/hsl/hsla colors - courtesy of https://gist.github.com/olmokramer/82ccce673f86db7cda5e
    // the first section matches a hex code which can be 3 or 6 digits long the
    // next section matches rgb or hsl value or with an a optionally
    // NB - the regex was tweak so it could match inside a string
    private _colorRegex = /#(?:[0-9a-f]{3}){1,2}|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\)/gi

    public get id() {
        return "color-highlight"
    }

    public get friendlyName() {
        return "CSS color highlight layer"
    }

    private _getColorHighlights = (context: Oni.BufferLayerRenderContext) => {
        return context.visibleLines.map((line, idx) => {
            const matches = line.match(this._colorRegex)
            if (matches) {
                const colors = matches.filter(Boolean)
                if (colors.length) {
                    const locations = colors.map(color => ({
                        color,
                        start: line.indexOf(color),
                        end: line.indexOf(color) + color.length,
                    }))
                    const currentLine = context.topBufferLine + idx - 1
                    return locations.map(location => {
                        const startPosition = context.bufferToPixel({
                            line: currentLine,
                            character: location.start,
                        })
                        const endPosition = context.bufferToPixel({
                            line: currentLine,
                            character: location.end,
                        })
                        const halfACharacter = context.fontPixelWidth / 2
                        const width =
                            endPosition.pixelX - startPosition.pixelX + context.fontPixelWidth
                        const adjustedLeft = startPosition.pixelX - halfACharacter
                        return (
                            <ColorHighlight
                                width={width}
                                color={location.color}
                                left={adjustedLeft}
                                top={startPosition.pixelY}
                                height={context.fontPixelHeight}
                                data-id="color-highlight"
                            />
                        )
                    })
                }
            }
            return null
        })
    }
}
