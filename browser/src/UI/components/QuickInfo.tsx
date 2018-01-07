import * as os from "os"

import * as React from "react"
import styled, { boxShadowInset, css, fontSizeSmall } from "./common"

const codeBlockStyle = css`
    color: ${p => p.theme.foreground};
    border-color: ${p => p.theme["toolTip.border"]};
    padding: 0.4em 0.4em 0.4em 0.4em;
    margin: 0.4em 0.4em 0.4em 0.4em;
`

export const Documentation = styled.div`
    ${fontSizeSmall};
    ${boxShadowInset};
    padding: 8px;
    min-width: 300px;
    max-height: 20vh;
    overflow-y: auto;
    margin-bottom: 0.8rem;

    &::-webkit-scrollbar {
        height: 2px;
    }

    > pre {
        ${codeBlockStyle};
    }
`

export const Title = styled.div`
    width: 100%;
    margin: 8px;
    overflow-x: hidden;
    padding: 0.2em;

    &:hover {
        overflow-x: overlay;
    }

    &::-webkit-scrollbar {
        height: 2px;
    }

    > p {
        margin: 0.2rem;
    }

    > a {
        text-decoration: ${p => p.theme["editor.foreground"]}
    }
`

export interface ITextProps {
    text?: string
    html?: {
        __html: string,
    }
}

export class TextComponent extends React.PureComponent<ITextProps, {}> {
    public componentDidMount() {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "./node_modules/highlight.js/styles/atom-one-dark.css"
        document.head.appendChild(link)
    }
}

export class QuickInfoTitle extends TextComponent {
    public render(): JSX.Element {
        return <Title dangerouslySetInnerHTML={this.props.html}>{this.props.text}</Title>
    }
}

export class QuickInfoDocumentation extends TextComponent {
    public render(): JSX.Element {
        const { text, html } = this.props
        switch (true) {
            case Boolean(text):
                const lines = this.props.text.split(os.EOL)
                const divs = lines.map((l, i) => <div key={`${l}-${i}`}>{l}</div>)
                return <Documentation>{divs}</Documentation>
            case Boolean(html && html.__html):
                return <Documentation dangerouslySetInnerHTML={this.props.html} />
            default:
                return null
        }
    }
}
