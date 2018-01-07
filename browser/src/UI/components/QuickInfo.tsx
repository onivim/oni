import * as os from "os"

import * as React from "react"
import styled, { boxShadowInset, fontSizeSmall } from "./common"

const Documentation = styled.div`
    ${fontSizeSmall};
    ${boxShadowInset};
    padding: 8px;
    min-width: 300px;
    max-height: 48px;
    overflow-y: auto;
    margin-bottom: 0.5rem;
`

const Title = styled.div`
    width: 100%;
    margin: 8px;
    overflow-x: hidden;

    &:hover {
        overflow-x: overlay;
    }

    &::-webkit-scrollbar {
        height: 2px;
    }
`

export interface ITextProps {
    text?: string
    html?: {
        __html: string,
    }
}

export class TextComponent extends React.PureComponent<ITextProps, {}> {

}

export class QuickInfoTitle extends TextComponent {
    public render(): JSX.Element {
        // return <div className="title">{this.props.text.replace(/\\/g, "")}</div>
        return <Title dangerouslySetInnerHTML={this.props.html}>{this.props.text}</Title>
    }
}

export class QuickInfoDocumentation extends TextComponent {
    public render(): JSX.Element {
        switch (true) {
            case !!this.props.text:
                const lines = this.props.text.split(os.EOL)
                const divs = lines.map((l) => <div key={l}>{l}</div>)
                return <Documentation>{divs}</Documentation>
            case !!this.props.html:
                return <Documentation dangerouslySetInnerHTML={this.props.html} />
            default:
                return null
        }
    }
}
