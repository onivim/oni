import * as marked from "marked"
import * as types from "vscode-languageserver-types"
import * as _ from "lodash"

const renderer = new marked.Renderer()

interface ITokens {
    scopes: any
    range: types.Range
}

interface IColors {
    highlightGroup: string
    range: types.Range
}

interface IRendererArgs {
    tokens?: ITokens[]
    colors?: IColors[]
    text: string
}

const scopesToString = (scope: object) =>
    Object.values(scope)
        .map(s => s.replace(/\./g, "_"))
        .join(" ")

const renderSpansWithClasses = ({ tokens, colors, text }: IRendererArgs) => {
    const unescapedText = _.unescape(text)
    if (tokens) {
        const spans = tokens.reduce((acc, token) => {
            const symbol = unescapedText.substring(
                token.range.start.character,
                token.range.end.character,
            )
            const replaced = acc.replace(
                symbol,
                `<span class="marked ${scopesToString(token.scopes)}">${symbol}</span>`,
            )
            return replaced
        }, unescapedText)
        return `<p>${spans}</p>`
    } else if (colors) {
        const spans = colors.reduce((acc, color) => {
            const symbol = unescapedText.substring(
                color.range.start.character,
                color.range.end.character,
            )
            const replaced = acc.replace(
                symbol,
                `<span class="marked ${color.highlightGroup}">${symbol}</span>`,
            )
            return replaced
        }, unescapedText)
        return `<p>${spans}</p>`
    }
    return `<p>${text}</p>`
}

interface IConversionArgs {
    markdown: string
    tokens?: ITokens[]
    colors?: IColors[]
}

export const convertMarkdown = ({
    markdown,
    tokens,
    colors,
}: IConversionArgs): { __html: string } => {
    marked.setOptions({
        sanitize: true,
        gfm: true,
        renderer,
    })

    if (tokens) {
        renderer.paragraph = text => renderSpansWithClasses({ text, tokens })
    } else if (colors) {
        renderer.paragraph = text => renderSpansWithClasses({ text, colors })
    }

    const html = marked(markdown)
    return { __html: html }
}
