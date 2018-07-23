import * as Color from "color"
import * as memoize from "lodash/memoize"
import * as Oni from "oni-api"
import * as Log from "oni-core-logging"
import * as React from "react"

import styled, { pixel, withProps } from "../../UI/components/common"

interface IBackground {
    top: number
    left: number
    height: number
    width: number
}

interface IHighlight {
    color: string
    fontFamily: string
    height: number
    fontSize: string
}

const Background = withProps<IBackground>(styled.div).attrs({
    style: (props: IBackground) => ({
        top: pixel(props.top),
        left: pixel(props.left),
        height: pixel(props.height),
        width: pixel(props.width),
    }),
})`
    background-color: ${p => p.theme["editor.background"]};
    position: absolute;
    white-space: nowrap;
`

const HighlightSpan = withProps<IHighlight>(styled.div)`
    display: block;
    height: 100%;
    width: 100%;
    color: ${p => (Color(p.color).dark() ? "white" : "black")};
    font-family: ${p => p.fontFamily};
    font-size: ${p => p.fontSize};
    line-height: ${p => pixel(p.height + 5)}; /* vertically center text inside the highlight */
    background-color: ${p => p.color};
`

interface IState {
    error: Error
}

type IProps = IHighlight & IBackground

class Highlight extends React.PureComponent<IProps, IState> {
    public state: IState = {
        error: null,
    }

    public componentDidCatch(error: Error) {
        this.setState({ error })
    }

    public render() {
        return (
            !this.state.error && (
                <Background
                    top={this.props.top}
                    left={this.props.left}
                    height={this.props.height}
                    width={this.props.width}
                >
                    <HighlightSpan
                        fontFamily={this.props.fontFamily}
                        fontSize={this.props.fontSize}
                        height={this.props.height}
                        color={this.props.color}
                    >
                        {this.props.children}
                    </HighlightSpan>
                </Background>
            )
        )
    }
}

export default class ColorHighlightLayer implements Oni.BufferLayer {
    public render = memoize((context: Oni.BufferLayerRenderContext) => (
        <>{this._getColorHighlights(context)}</>
    ))

    private readonly CSS_COLOR_NAMES = [
        "AliceBlue",
        "AntiqueWhite",
        "Aqua",
        "Aquamarine",
        "Azure",
        "Beige",
        "Bisque",
        "Black",
        "BlanchedAlmond",
        "Blue",
        "BlueViolet",
        "Brown",
        "BurlyWood",
        "CadetBlue",
        "Chartreuse",
        "Chocolate",
        "Coral",
        "CornflowerBlue",
        "Cornsilk",
        "Crimson",
        "Cyan",
        "DarkBlue",
        "DarkCyan",
        "DarkGoldenRod",
        "DarkGray",
        "DarkGrey",
        "DarkGreen",
        "DarkKhaki",
        "DarkMagenta",
        "DarkOliveGreen",
        "Darkorange",
        "DarkOrchid",
        "DarkRed",
        "DarkSalmon",
        "DarkSeaGreen",
        "DarkSlateBlue",
        "DarkSlateGray",
        "DarkSlateGrey",
        "DarkTurquoise",
        "DarkViolet",
        "DeepPink",
        "DeepSkyBlue",
        "DimGray",
        "DimGrey",
        "DodgerBlue",
        "FireBrick",
        "FloralWhite",
        "ForestGreen",
        "Fuchsia",
        "Gainsboro",
        "GhostWhite",
        "Gold",
        "GoldenRod",
        "Gray",
        "Grey",
        "Green",
        "GreenYellow",
        "HoneyDew",
        "HotPink",
        "IndianRed",
        "Indigo",
        "Ivory",
        "Khaki",
        "Lavender",
        "LavenderBlush",
        "LawnGreen",
        "LemonChiffon",
        "LightBlue",
        "LightCoral",
        "LightCyan",
        "LightGoldenRodYellow",
        "LightGray",
        "LightGrey",
        "LightGreen",
        "LightPink",
        "LightSalmon",
        "LightSeaGreen",
        "LightSkyBlue",
        "LightSlateGray",
        "LightSlateGrey",
        "LightSteelBlue",
        "LightYellow",
        "Lime",
        "LimeGreen",
        "Linen",
        "Magenta",
        "Maroon",
        "MediumAquaMarine",
        "MediumBlue",
        "MediumOrchid",
        "MediumPurple",
        "MediumSeaGreen",
        "MediumSlateBlue",
        "MediumSpringGreen",
        "MediumTurquoise",
        "MediumVioletRed",
        "MidnightBlue",
        "MintCream",
        "MistyRose",
        "Moccasin",
        "NavajoWhite",
        "Navy",
        "OldLace",
        "Olive",
        "OliveDrab",
        "Orange",
        "OrangeRed",
        "Orchid",
        "PaleGoldenRod",
        "PaleGreen",
        "PaleTurquoise",
        "PaleVioletRed",
        "PapayaWhip",
        "PeachPuff",
        "Peru",
        "Pink",
        "Plum",
        "PowderBlue",
        "Purple",
        "Red",
        "RosyBrown",
        "RoyalBlue",
        "SaddleBrown",
        "Salmon",
        "SandyBrown",
        "SeaGreen",
        "SeaShell",
        "Sienna",
        "Silver",
        "SkyBlue",
        "SlateBlue",
        "SlateGray",
        "SlateGrey",
        "Snow",
        "SpringGreen",
        "SteelBlue",
        "Tan",
        "Teal",
        "Thistle",
        "Tomato",
        "Turquoise",
        "Violet",
        "Wheat",
        "White",
        "WhiteSmoke",
        "Yellow",
        "YellowGreen",
    ]

    // Match hex/rgb/rgba/hsl/hsla colors -
    // courtesy of https://gist.github.com/olmokramer/82ccce673f86db7cda5e
    // the first section matches a hex code which can be 3 or 6 digits long the
    // next section matches rgb or hsl value with an a optionally
    // NB - the regex was tweaked so it could match inside a string
    private _colorCodeRegex = /#(?:[0-9a-f]{3}){1,2}|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\)/gi
    private _colorRegex: RegExp

    private _fontSize: string
    private _fontFamily: string

    constructor(private _config: Oni.Configuration) {
        this._fontSize = this._config.getValue("editor.fontSize")
        this._fontFamily = this._config.getValue("editor.fontFamily")
        this._config.onConfigurationChanged.subscribe(this._updateFontFamily)

        this._constructRegex()
    }

    public get id() {
        return "color-highlight"
    }

    public get friendlyName() {
        return "CSS color highlight layer"
    }

    private _updateFontFamily = (configChanges: Partial<Oni.ConfigurationValues>) => {
        const fontFamilyChanged = Object.keys(configChanges).includes("editor.fontFamily")
        if (fontFamilyChanged) {
            this._fontFamily = configChanges["editor.fontFamily"]
        }
    }

    private _constructRegex() {
        // Construct a regex checking for both color codes and all the different css colornames
        const colorNames = this.CSS_COLOR_NAMES.map(name => `\\b${name}\\b`)
        const colorNamesRegex = new RegExp("(" + colorNames.join("|") + ")")
        this._colorRegex = new RegExp(
            colorNamesRegex.source + "|" + this._colorCodeRegex.source,
            "gi",
        )
    }

    private _getColorHighlights = (context: Oni.BufferLayerRenderContext) => {
        return context.visibleLines.map((line, idx) => {
            try {
                const matches = line.match(this._colorRegex)
                if (matches) {
                    const colors = matches.filter(Boolean)
                    if (colors.length) {
                        const locations = colors.map(c => ({
                            color: c,
                            start: line.indexOf(c),
                            end: line.indexOf(c) + c.length,
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

                            if (!startPosition || !endPosition) {
                                return null
                            }

                            const width = endPosition.pixelX - startPosition.pixelX
                            return (
                                <Highlight
                                    width={width}
                                    left={startPosition.pixelX}
                                    top={startPosition.pixelY}
                                    height={context.fontPixelHeight}
                                    fontSize={this._fontSize}
                                    fontFamily={this._fontFamily}
                                    color={location.color.toLowerCase()}
                                    data-id="color-highlight"
                                >
                                    {location.color}
                                </Highlight>
                            )
                        })
                    }
                }
            } catch (e) {
                Log.warn(`Failed to create color highlights because ${e.message}`)
                return null
            }
            return null
        })
    }
}
