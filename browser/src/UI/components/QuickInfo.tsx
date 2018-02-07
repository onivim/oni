import * as os from "os"

import * as React from "react"
import styled, { boxShadowInset, css, fontSizeSmall, withProps } from "./common"

const markedCss = css`
    .marked {
        margin: 0;
        padding-right: 0;
        padding-left: 0;
        white-space: pre-wrap;
    }

    .marked-identifier {
        color: ${p => p.theme["editor.tokenColors"].identifier.settings.foreground};
    }

    .marked-function {
        color: ${p => p.theme["editor.tokenColors"].function.settings.foreground};
    }

    .marked-constant {
        color: ${p => p.theme["editor.tokenColors"].constant.settings.foreground};
    }

    .meta-import {
        color: ${p => p.theme["editor.tokenColors"]["meta.import"].settings.foreground};
    }

    .meta-class {
        color: ${p => p.theme["editor.tokenColors"]["meta.class"].settings.foreground};
    }

    .variable-other {
        color: ${p => p.theme["editor.tokenColors"]["variable.other"].settings.foreground};
    }

    .meta-object-type {
        color: ${p => p.theme["editor.tokenColors"]["meta.object.type"].settings.foreground};
    }

    .meta-brace-round {
        color: ${p => p.theme["editor.tokenColors"]["meta.brace.round"].settings.foreground};
    }

    .meta-function-call {
        color: ${p => p.theme["editor.tokenColors"]["meta.function.call"].settings.foreground};
    }

    .meta-type-declaration {
        color: ${p => p.theme["editor.tokenColors"]["meta.type.declaration"].settings.foreground};
    }

    .meta-type-annotation {
        color: ${p => p.theme["editor.tokenColors"]["meta.type.annotation"].settings.foreground};
    }

    .support-class-builtin {
        color: ${p => p.theme["editor.tokenColors"]["support.class.builtin"].settings.foreground};
    }

    .support-type-primitive {
        color: ${p => p.theme["editor.tokenColors"]["support.type.primitive"].settings.foreground};
    }

    .variable-other-readwrite {
        color: ${p =>
            p.theme["editor.tokenColors"]["variable.other.readwrite"].settings.foreground};
    }

    .variable-other-property {
        color: ${p =>
            p.theme["editor.tokenColors"]["variable.other.readwrite"].settings.foreground};
    }

    .variable-other-object {
        color: ${p =>
            p.theme["editor.tokenColors"]["variable.other.readwrite"].settings.foreground};
    }

    .keyword-control-import {
        color: ${p => p.theme["editor.tokenColors"]["keyword.control.import"].settings.foreground};
    }
`

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

    > code {
        background-color: inherit;
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

        pre {
            ${codeBlockStyle};
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
    }
`

export const Documentation = styled.div`
    ${fontSizeSmall};
    ${boxShadowInset};
    overflow: hidden;
    max-height: 25vh;
    max-width: 45vw;
    padding: 0.5rem;
    line-height: 1.5;
    ${smallScrollbar};
    background-color: ${p => p.theme["editor.hover.contents.background"]};
    color: ${p => p.theme["editor.hover.contents.foreground"]};
    ${markedCss};

    &:hover {
        overflow: overlay;
    }

    ${childStyles};

    pre {
        ${smallScrollbar};
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
    padding?: string
    text?: string
    html?: {
        __html: string
    }
}

export class QuickInfoTitle extends React.PureComponent<ITextProps> {
    public render(): JSX.Element {
        const { html, text, padding } = this.props
        if (!html && !text) {
            return null
        }

        return (
            <Title padding={padding} dangerouslySetInnerHTML={html}>
                {text}
            </Title>
        )
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
