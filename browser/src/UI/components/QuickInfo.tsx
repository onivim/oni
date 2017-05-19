import * as React from "react"
import { connect } from "react-redux"

import { IState } from "./../State"

require("./QuickInfo.less") // tslint:disable-line no-var-requires

export interface IQuickInfoProps {
    visible: boolean
    wrap: boolean
    x: number
    y: number
    elements: JSX.Element[]
}

export class QuickInfo extends React.Component<IQuickInfoProps, void> {

    public render(): null | JSX.Element {
        if (!this.props.elements || !this.props.elements.length) {
            return null
        }

        const containerStyle = {
            position: "absolute",
            top: this.props.y.toString() + "px",
            left: this.props.x.toString() + "px",
        }

        const innerStyle = {
            "position": "absolute",
            "bottom": "0px",
            "opacity": this.props.visible ? 1 : 0,
            "whiteSpace": this.props.wrap ? "normal" : "nowrap",
            "max-width": (document.body.offsetWidth - this.props.x - 40) + "px",
        }

        return <div key={"quickinfo-container"} className="quickinfo-container" style={containerStyle}>
            <div key={"quickInfo"} style={innerStyle} className="quickinfo">
                {this.props.elements}
            </div>
        </div>
    }
}

export interface ITextProps {
    text: string
}

export class TextComponent extends React.Component<ITextProps, void> {

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

const mapStateToQuickInfoProps = (state: IState) => {
    if (!state.quickInfo) {
        return {
            wrap: true,
            visible: false,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: [],
        }
    } else {
        return {
            wrap: true,
            visible: true,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: [
                <QuickInfoTitle text={state.quickInfo.title} />,
                <QuickInfoDocumentation text={state.quickInfo.description} />,
            ],
        }
    }
}

const mapStateToSignatureHelpProps = (state: IState) => {

    if (!state.signatureHelp) {
        return {
            wrap: false,
            visible: false,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: [],
        }
    } else {
        const currentItem = state.signatureHelp.items[state.signatureHelp.selectedItemIndex]

        const parameters = currentItem.parameters.map((item, idx) => {
            // check state.signatureHelp to avoid "Object is possibly 'null'" error
            // even though we already checked it in the 'if' statement above
            if (state.signatureHelp && idx === state.signatureHelp.argumentIndex) {
                return <SelectedText text={item.text} />
            } else {
                return <Text text={item.text} />
            }
        })

        // insert ", " separator in between each parameter
        for (let i = currentItem.parameters.length - 1; i > 0; i -= 1) {
          parameters.splice(i, 0, <Text text={currentItem.separator + " "} />)
        }

        let elements = [<Text text={currentItem.prefix} />]
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
            elements,
        }
    }
}

export const QuickInfoContainer = connect(mapStateToQuickInfoProps)(QuickInfo)
export const SignatureHelpContainer = connect(mapStateToSignatureHelpProps)(QuickInfo)
