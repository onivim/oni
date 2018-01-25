import * as React from "react"

export interface ITextProps {
    text: string
}

export class TextComponent extends React.PureComponent<ITextProps, {}> {}

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
