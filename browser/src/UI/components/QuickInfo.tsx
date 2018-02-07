import * as os from "os"

import * as React from "react"
import styled, { boxShadowInset, css, fontSizeSmall, IThemeColors, withProps } from "./common"

const cssToken = (p: { theme: IThemeColors }, token: string) => (property: string) => {
    try {
        const details = p.theme["editor.tokenColors"][token]
        return details.settings[property]
    } catch (e) {
        if (property === "foreground") {
            return p.theme["toolTip.foreground"]
        }
    }
}
const constructClassName = (token: string) => (p: { theme: IThemeColors }) => {
    const tokenAsClass = token.replace(/[.]/g, "-")
    const tokenStyle = cssToken(p, token)
    const cssClass = `
        .${tokenAsClass} {
            color: ${tokenStyle("foreground")};
            font-weight: ${tokenStyle("bold") && "bold"};
            font-style: ${tokenStyle("italic") && "italic"};
        }
    `
    return cssClass
}

const symbols = [
    "source",
    "marked.identifier",
    "marked.function",
    "marked.constant",
    "meta.import",
    "meta.class",
    "variable.other",
    "meta.object.type",
    "meta.brace.round",
    "meta.function.call",
    "meta.type.declaration",
    "meta.type.annotation",
    "support.class.builtin",
    "support.type.primitive",
    "variable.other.readwrite",
    "variable.other.property",
    "variable.other.object",
    "storage.type.enum",
    "storage.type.interface",
    "entity.name.type.enum",
    "entity.name.type.interface",
    "keyword.control.import",
    "keyword.operator.relational",
    "punctuation.terminator",
    "punctuation.accessor",
    "punctuation.definition.block",
    "punctuation.separator.comma",
    "punctuation.separator.continuation",
    "punctuation.definition.parameters.begin",
    "punctuation.definition.parameters.end",
    "punctuation.separator.continuation",
].map(constructClassName)

type TokenFunc = (p: { theme: IThemeColors }) => string

const flattenedSymbols = (p: { theme: IThemeColors }, fns: TokenFunc[]) =>
    fns.map(fn => fn(p)).join("\n")

const markedCss = css`
    .marked {
        margin: 0;
        padding-right: 0;
        padding-left: 0;
        white-space: pre-wrap;
    }

    ${props => flattenedSymbols(props, symbols)};
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
