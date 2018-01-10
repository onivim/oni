import * as os from "os"

import * as React from "react"
import styled, { css } from "./common"

const codeBlockStyle = css`
    color: ${p => p.theme.foreground};
    border-color: ${p => p.theme["toolTip.border"]};
    padding: 0.4em 0.4em 0.4em 0.4em;
    margin: 0.4em 0.4em 0.4em 0.4em;
    width: 100%;
`

const childStyles = css`
    > * {
        margin: 0.2rem;

       a {
            color: ${p => p.theme["highlight.mode.normal.background"]};
        }

        pre {
            display: flex;
            ${codeBlockStyle};
        }

        code {
            tab-size: 4;
        }
    }
`

export const Documentation = styled.div`
    overflow: auto;
    margin-bottom: 0.8rem;

    &::-webkit-scrollbar {
        height: 4px;
    }

    ${childStyles};
`
// NOTE: Currently with a max-width in CursorPositioner the text
// in the hover element can occasionally appear to have too much padding
// this is due to a browser quirk where it renders the maxWidth but does
// not resize once truncated the solutions are
// 1. word-break: break all in the title component (causes breaks between words)
// - the above seems to be vscode's solution
// 2. fit-content: to mitigate but not fix the padding issue (current solution)
export const Title = styled.div`
    border-bottom: 2px solid ${p => p.theme["editor.foreground"]};

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

export const QuickInfoContainer = styled.div`
  padding: 0.6rem;
  width: fit-content;
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
