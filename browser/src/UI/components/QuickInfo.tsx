import * as React from "react"
import { connect } from "react-redux"

import { State } from "./../State"

require("./QuickInfo.less")

export interface QuickInfoProps {
    visible: boolean
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
            opacity: this.props.visible ? 1 : 0
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


const mapStateToQuickInfoProps = (state: State) => {
    if (!state.quickInfo) {
        return {
            visible: false,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: []
        }
    } else {
        return {
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
            visible: false,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: []
        }
    } else {
        return {
            visible: true,
            x: state.cursorPixelX,
            y: state.cursorPixelY - (state.fontPixelHeight),
            elements: [
                <QuickInfoTitle text={JSON.stringify(state.signatureHelp)} />
            ]
        }

    }
}

export const QuickInfoContainer = connect(mapStateToQuickInfoProps)(QuickInfo)
export const SignatureHelpContainer = connect(mapStateToSignatureHelpProps)(QuickInfo)
