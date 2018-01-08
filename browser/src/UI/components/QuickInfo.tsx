import * as os from "os"

import * as React from "react"
import styled, { boxShadowInset, css, fallBackFonts, fontSizeSmall } from "./common"

const codeBlockStyle = css`
    color: ${p => p.theme.foreground};
    border-color: ${p => p.theme["toolTip.border"]};
    padding: 0.4em 0.4em 0.4em 0.4em;
    margin: 0.4em 0.4em 0.4em 0.4em;
`

const childStyles = css`
    > * {
        margin: 0.2rem;

       a {
            color: ${p => p.theme["highlight.mode.normal.background"]};
        }

        pre {
            ${codeBlockStyle};
        }
        code {
            font-family: ${fallBackFonts}
        }
    }
`

export const Documentation = styled.div`
    ${fontSizeSmall};
    ${boxShadowInset};
    padding: 0.8rem;
    min-width: 300px;
    overflow-y: auto;
    margin-bottom: 0.8rem;

    &::-webkit-scrollbar {
        height: 4px;
    }

    ${childStyles};
`

export const Title = styled.div`
    width: auto;
    margin: 0.2rem;
    padding: 0.2rem;

    &:hover {
        overflow-x: overlay;
    }

    &::-webkit-scrollbar {
        height: 2px;
    }

    > * {
        margin: 0.2rem;
        a {
            color: ${p => p.theme["editor.foreground"]}
        }
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
