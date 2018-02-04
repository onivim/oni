import { unescape } from "lodash"
import * as marked from "marked"
import * as types from "vscode-languageserver-types"

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
    element?: string
}

const scopesToString = (scope: object) =>
    Object.values(scope)
        .map(s => s.replace(/\./g, "_"))
        .join(" ")

const escapeRegExp = (str: string) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

const renderWithClasses = ({ tokens, colors, text, element = "span" }: IRendererArgs) => {
    // This is critical because marked's renderer refuses to leave html untouched so it converts
    // special chars to html entities which are rendered correctly in react
    const unescapedText = unescape(text)
    if (tokens) {
        const spans = tokens.reduce((acc, token) => {
            const symbol = unescapedText.substring(
                token.range.start.character,
                token.range.end.character,
            )
            const replaced = acc.replace(
                symbol,
                `<${element} class="marked ${scopesToString(token.scopes)}">${symbol}</${element}>`,
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
            // This is a regular expression look ahead which checks that the symbol is not followed
            // by the word "class=" or by a > which might indicate that it is in an html tag
            const negativeLookahead = "(?![ class=]|>)"
            const regSymbol = escapeRegExp(symbol)
            const regex = new RegExp(`${regSymbol}${negativeLookahead}`)
            const parts = acc.split(regex)
            // console.log("acc: ", acc)
            // console.log("symbol: ", symbol)
            return parts.join(
                `<${element} class="marked marked-${color.highlightGroup.toLowerCase()}">${symbol}</${element}>`,
            )
        }, unescapedText)
        return `<p>${spans}</p>`
    }
    return `<p>${text}</p>`
}

interface IConversionArgs {
    markdown: string
    tokens?: ITokens[]
    colors?: IColors[]
    type?: string
}

export const convertMarkdown = ({
    markdown,
    tokens,
    colors,
    type = "title",
}: IConversionArgs): { __html: string } => {
    marked.setOptions({
        sanitize: true,
        gfm: true,
        renderer,
    })

    switch (type) {
        case "documentation":
            renderer.codespan = text => renderWithClasses({ text, colors, element: "code" })
            break
        case "title":
        default:
            if (tokens) {
                renderer.paragraph = text => renderWithClasses({ text, tokens })
            } else if (colors) {
                renderer.paragraph = text => renderWithClasses({ text, colors })
            }
    }

    const html = marked(markdown)
    return { __html: html }
}
