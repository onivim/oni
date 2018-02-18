import * as os from "os"

import * as React from "react"
import styled, { boxShadowInset, css, fontSizeSmall, withProps } from "./common"

const codeBlockStyle = css`
    color: ${p => p.theme.foreground};
    padding: 0.4em 0.4em 0.4em 0.4em;
    margin: 0.4em 0.4em 0.4em 0.4em;

    > code {
        background-color: inherit;
    }
`

const markedCss = css`
    .marked {
        margin: 0;
        padding-right: 0;
        padding-left: 0;
    }

    .marked-paragraph {
        white-space: pre-wrap;
    }

    .marked-pre {
        word-wrap: break-word;
        white-space: pre-wrap;
        margin: 0;
    }
`

const smallScrollbar = css`
    &::-webkit-scrollbar {
        height: 4px;
        width: 4px;
    }
`

const childStyles = css`
    > * {
        /* necessary to prevent overflow */
        margin: 0.2rem;
        max-width: 45vw;

        ${markedCss};

        a {
            color: ${p => p.theme["highlight.mode.normal.background"]};
        }
    }

    /*
    All code blocks are set to black but
    this is overriden for code blocks INSIDE a Pre element
    */

    code {
        background-color: ${p => p.theme["editor.hover.contents.codeblock.background"]};
        color: ${p => p.theme["editor.hover.contents.codeblock.foreground"]};
        padding: 0 0.2rem;
    }
`

interface DocProps {
    tokenStyles?: any
}
export const Documentation = withProps<DocProps>(styled.div)`
    ${fontSizeSmall};
    ${boxShadowInset};
    overflow: hidden;
    max-height: 25vh;
    padding: 0.5rem;
    line-height: 1.5;
    ${smallScrollbar};
    background-color: ${p => p.theme["editor.hover.contents.background"]};
    color: ${p => p.theme["editor.hover.contents.foreground"]};
    ${markedCss};
    ${p => p.tokenStyles};

    &:hover {
        overflow: overlay;
    }

    ${childStyles};

    pre {
        ${smallScrollbar};
        ${codeBlockStyle};
    }
`

interface TitleProps {
    padding?: string
    tokenStyles?: any
}
export const Title = withProps<TitleProps>(styled.div)`
    padding: ${p => p.padding || "0.7rem"};
    overflow: hidden;
    max-height: 22vh;
    max-width: 45vw;
    word-break: break-all;
    ${smallScrollbar};
    background-color:${p => p.theme["editor.hover.title.background"]};
    color: ${p => p.theme["editor.hover.title.foreground"]};
    white-space: pre-wrap;
    ${markedCss};
    ${p => p.tokenStyles};

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
  padding-bottom: ${p => (p.hasDocs ? "0.5rem" : "0")};
  background-color: ${p => p.theme["editor.hover.contents.background"]};
`

export interface ITextProps {
    tokenStyles?: any
    padding?: string
    text?: string
    html?: {
        __html: string
    }
}

export class QuickInfoTitle extends React.PureComponent<ITextProps> {
    public render(): JSX.Element {
        const { html, text, padding, tokenStyles } = this.props
        if (!html && !text) {
            return null
        }

        return (
            <Title padding={padding} dangerouslySetInnerHTML={html} tokenStyles={tokenStyles}>
                {text}
            </Title>
        )
    }
}

export class QuickInfoDocumentation extends React.PureComponent<ITextProps> {
    public render(): JSX.Element {
        const { text, html, tokenStyles } = this.props
        switch (true) {
            case Boolean(text):
                const lines = this.props.text.split(os.EOL)
                const divs = lines.map((l, i) => <div key={`${l}-${i}`}>{l}</div>)

                return <Documentation>{divs}</Documentation>
            case Boolean(html && html.__html.length):
                return (
                    <Documentation
                        dangerouslySetInnerHTML={this.props.html}
                        tokenStyles={tokenStyles}
                    />
                )
            default:
                return null
        }
    }
}
