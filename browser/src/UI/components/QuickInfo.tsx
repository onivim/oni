import * as React from "react"
import { connect } from "react-redux"

import { State } from "./../State"

require("./QuickInfo.less")

export interface QuickInfoProps {
    visible: boolean
    wrap: boolean
    x: number
    y: number
    elements: JSX.Element[]
}

export class QuickInfo extends React.Component<QuickInfoProps, void> {

    public render(): JSX.Element {

        const containerStyle = {
            position: "absolute",
            top: this.props.y.toString() + "px",
            left: this.props.x.toString() + "px",
        }

        const innerStyle = {
            position: "absolute",
            bottom: "0px",
            opacity: this.props.visible ? 1 : 0,
            whiteSpace: this.props.wrap ? "normal" : "nowrap"
        }

        return <div key={"quickinfo-container"} className="quickinfo-container" style={containerStyle}>
            <div key={"quickInfo"} style={innerStyle} className="quickinfo">
                {this.props.elements}
            </div>
        </div>
    }
}

export interface TextProps {
    text: string
}

export class TextComponent extends React.Component<TextProps, void> {

}

export class QuickInfoTitle extends TextComponent {
    public render(): JSX.Element {
        return <div className="title">{this.props.text}</div>
    }
}

export class QuickInfoDocumentation extends TextComponent {
    public render(): JSX.Element {
        return <div className="documentation">{this.props.text}</div>
    }
}

export class Text extends TextComponent {
    public render(): JSX.Element {
        return <span>{this.props.text}</span>
    }
}

export class SelectedText extends TextComponent {
    public render(): JSX.Element {
        return <span className="selected">{this.props.text}</span>
    }
}

const mapStateToQuickInfoProps = (state: State) => {
    if (!state.quickInfo) {
        return {
            wrap: true,
            visible: false,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: []
        }
    } else {
        return {
            wrap: true,
            visible: true,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: [
                <QuickInfoTitle text={state.quickInfo.title} />,
                <QuickInfoDocumentation text={state.quickInfo.description} />
            ]
        }
    }
}

const mapStateToSignatureHelpProps = (state: State) => {

    if (!state.signatureHelp) {
        return {
            wrap: false,
            visible: false,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: []
        }
    } else {
        const currentItem = state.signatureHelp.items[state.signatureHelp.selectedItemIndex];

        const argumentCount = state.signatureHelp.argumentCount

        const parameters = currentItem.parameters.map((item, idx) => {

            const sidx = Math.min(idx, currentItem.parameters.length)

            let currentText = item.text
            if (idx < argumentCount)
                currentText += currentItem.separator + " "

            if (sidx === state.signatureHelp.argumentIndex)
                return <SelectedText text={currentText} />
            else
                return <Text text={currentText} />
        })

        let elements = [].concat([<Text text={currentItem.prefix} />])
            .concat(parameters)
            .concat([<Text text={currentItem.suffix} />])

        const selectedIndex = Math.min(currentItem.parameters.length, state.signatureHelp.argumentIndex)
        const selectedArgument = currentItem.parameters[selectedIndex]
        if (selectedArgument && selectedArgument.documentation) {
            elements.push(<QuickInfoDocumentation text={selectedArgument.documentation} />)
        }

        return {
            wrap: false,
            visible: true,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: elements
        }

    }
}

export const QuickInfoContainer = connect(mapStateToQuickInfoProps)(QuickInfo)
export const SignatureHelpContainer = connect(mapStateToSignatureHelpProps)(QuickInfo)
