import * as os from "os"

import * as React from "react"

import * as Colors from "./../Colors"

import { CursorPositioner } from "./CursorPositioner"

require("./QuickInfo.less") // tslint:disable-line no-var-requires

export interface IQuickInfoProps {
    visible: boolean
    elements: JSX.Element[]

    backgroundColor: string
    foregroundColor: string
}

export class QuickInfo extends React.PureComponent<IQuickInfoProps, void> {

    public render(): null | JSX.Element {
        if (!this.props.elements || !this.props.elements.length) {
            return null
        }

        const borderColorString = Colors.getBorderColor(this.props.backgroundColor, this.props.foregroundColor)

        const quickInfoStyle: React.CSSProperties = {
            "opacity": this.props.visible ? 1 : 0,
            backgroundColor: this.props.backgroundColor,
            border: `1px solid ${borderColorString}`,
            color: this.props.foregroundColor,
        }

        return <CursorPositioner beakColor={borderColorString}>
            <div key={"quickinfo-container"} className="quickinfo-container enable-mouse">
                <div key={"quickInfo"} style={quickInfoStyle} className="quickinfo">
                    {this.props.elements}
                </div>
            </div>
        </CursorPositioner>
    }
}

export interface ITextProps {
    text: string
}

export class TextComponent extends React.PureComponent<ITextProps, void> {

}

export class QuickInfoTitle extends TextComponent {
    public render(): JSX.Element {
        return <div className="title">{this.props.text}</div>
    }
}

export class QuickInfoDocumentation extends TextComponent {
    public render(): JSX.Element {

        if (!this.props.text) {
            return null
        }

        const lines = this.props.text.split(os.EOL)
        const divs = lines.map((l) => <div>{l}</div>)

        return <div className="documentation">{divs}</div>
    }
}
