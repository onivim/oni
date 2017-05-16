import * as React from "react"

require("./QuickInfo.less") // tslint:disable-line no-var-requires

export interface IQuickInfoProps {
    visible: boolean
    wrap: boolean
    x: number
    y: number
    elements: JSX.Element[]
}

export class QuickInfo extends React.PureComponent<IQuickInfoProps, void> {

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
