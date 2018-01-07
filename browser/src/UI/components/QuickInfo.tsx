import * as os from "os"

import * as React from "react"
import styled, { boxShadowInset, css, fontSizeSmall } from "./common"

const fallBackFonts = `
    Consolas,
    Menlo,
    Monaco,
    Lucida Console,
    Liberation Mono,
    DejaVu Sans Mono,
    Bitstream Vera Sans Mono,
    Courier New,
    monospace,
    sans-serif
`.replace("\n", "")

const codeBlockStyle = css`
    /* background: ${p => p.theme.background}; */
    color: ${p => p.theme.foreground};
    border-color: ${p => p.theme["toolTip.border"]};
    font-family: ${fallBackFonts}
    padding: 0.4em 0.4em 0.4em 0.4em;
    margin: 0.4em 0.4em 0.4em 0.4em;
`

const Documentation = styled.div`
    ${fontSizeSmall};
    ${boxShadowInset};
    padding: 8px;
    min-width: 300px;
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 0.8rem;

    > pre {
        ${codeBlockStyle};
    }
`

const Title = styled.div`
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

export class TextComponent extends React.PureComponent<ITextProps, {}> {}

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
