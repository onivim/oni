import * as os from "os"

import * as React from "react"
import styled, { boxShadowInset, css, darken, fontSizeSmall, withProps } from "./common"

const smallScrollbar = css`
    &::-webkit-scrollbar {
        height: 4px;
        width: 4px;
    }
`

const codeBlockStyle = css`
    color: ${p => p.theme.foreground};
    padding: 0.4em 0.4em 0.4em 0.4em;
    margin: 0.4em 0.4em 0.4em 0.4em;
    /* necessary to prevent overflow */
    max-width: 55vw;

    > code {
        background-color: inherit;
    }
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

    /* All code blocks are set to black but
    this overriden for code block INSIDE a Pre element */

        code {
            background-color: ${p => darken(p.theme.background, 0.25)};
            padding: 0 0.2rem;
        }
    }
`

export const Documentation = styled.div`
    ${fontSizeSmall};
    ${boxShadowInset};
    overflow: hidden;
    max-height: 25vh;
    padding: 0.5rem;
    line-height: 1.5;
    ${smallScrollbar};
    background-color:${p => p.theme["editor.hover.contents.background"]};
    color: ${p => p.theme["editor.hover.contents.foreground"]};

    &:hover {
        overflow: overlay;
    }

    ${childStyles};

    pre {
        ${smallScrollbar}
        ${codeBlockStyle};
    }
`
// NOTE: Currently with a max-width in CursorPositioner the text
// in the hover element can occasionally appear to have too much padding
// this is due to a browser quirk where it renders the maxWidth but does
// not resize once truncated the solution is
// 1. word-break: break all in the title component (causes breaks between words)
// - the above seems to be vscode's solution
export const Title = withProps<{ padding?: string }>(styled.div)`
    padding: ${p => p.padding || "0.5rem"};
    overflow: hidden;
    max-height: 25vh;
    word-break: break-all;
    ${smallScrollbar};
    background-color:${p => p.theme["editor.hover.title.background"]};
    color: ${p => p.theme["editor.hover.title.foreground"]};

    &:hover {
        overflow: overlay;
    }

    > * {
        margin: 0.2rem;
        a {
            color: ${p => p.theme["editor.foreground"]}
        }
    }
`

export const QuickInfoContainer = withProps<{ hasDocs: boolean }>(styled.div)`
  max-height: fit-content;
  overflow: hidden;
  width: 100%;
  padding-bottom: ${p => p.hasDocs ? "1rem" : "0"};
  background-color: ${p => p.theme["editor.hover.contents.background"]};
`

export interface ITextProps {
    padding?: string,
    text?: string,
    html?: {
        __html: string,
    }
}

export class QuickInfoTitle extends React.PureComponent<ITextProps> {
    public render(): JSX.Element {
        const { html, text, padding } = this.props
        if (!html && !text) {
            return null
        }

        return <Title padding={padding} dangerouslySetInnerHTML={html}>{text}</Title>
    }
}

export class QuickInfoDocumentation extends React.PureComponent<ITextProps> {
    public render(): JSX.Element {
        const { text, html } = this.props
        switch (true) {
            case Boolean(text):
                const lines = this.props.text.split(os.EOL)
                const divs = lines.map((l, i) => <div key={`${l}-${i}`}>{l}</div>)

                return <Documentation>{divs}</Documentation>
            case Boolean(html && html.__html.length):

                return <Documentation dangerouslySetInnerHTML={this.props.html} />
            default:
                return null
        }
    }
}
