import { unescape } from "lodash"
import * as marked from "marked"
import * as types from "vscode-languageserver-types"

const renderer = new marked.Renderer()

interface ITokens {
    scopes: any
    range: types.Range
}

interface IRendererArgs {
    tokens?: ITokens[]
    text: string
    element?: TextElement
    container?: TextElement
}

const scopesToString = (scope: object) => {
    if (scope) {
        return Object.values(scope)
            .map((s: string) => {
                const lastStop = s.lastIndexOf(".")
                const remainder = s.substring(0, lastStop)
                return remainder.replace(/\./g, "-")
            })
            .filter(value => !!value)
            .join(" ")
    }
    return null
}

/**
 * escapeRegExp
 * Escapes a string intended for use as a regexp
 * @param {string} str
 * @returns {string}
 */
function escapeRegExp(str: string) {
    // NOTE This does NOT escape the "|" operator as it's needed for the Reg Exp
    // Also does not escape "\-" as hypenated tokes can be found
    return str.replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\n\r]/g, "\\$&")
}

type TextElement = "code" | "pre" | "paragraph" | "span"
const createContainer = (type: TextElement, content: string) => {
    switch (type) {
        case "code":
            return `<code class="marked-code">
                        ${content}
                     <code>
            `
        case "pre":
            return `
                <pre class="marked-pre">
                    ${content}
                 </pre>
            `
        case "paragraph":
            return `<${type} class="marked-paragraph">${content}<${type}>`
        default:
            return content
    }
}

/**
 * Takes a list of tokens which contain ranges, the text from marked (3rd party lib)
 * uses a reg exp to replace all matching tokens with an element with a class that is styled
 * else where
 * @returns {string}
 */
function renderWithClasses({
    tokens,
    text,
    element = "span",
    container = "paragraph",
}: IRendererArgs) {
    // This is critical because marked's renderer refuses to leave html untouched so it converts
    // special chars to html entities which are rendered correctly in react
    const unescapedText = unescape(text)
    if (tokens) {
        const symbols = tokens.reduce((acc, token) => {
            const symbol = unescapedText.substring(
                token.range.start.character,
                token.range.end.character,
            )
            acc[symbol] = token.scopes
            return acc
        }, {})

        const symbolNames = Object.keys(symbols)
        const banned = ["\n", "\r", " ", "|"]
        const filteredNames = symbolNames.filter(str => !banned.includes(str))
        // FIXME: RegExp does not respect word boundaries
        const symbolRegex = new RegExp("(" + escapeRegExp(filteredNames.join("|")) + ")", "g")
        const html = unescapedText.replace(symbolRegex, (match, ...args) => {
            const className = scopesToString(symbols[match])
            return `<${element} class="marked ${className}">${match}</${element}>`
        })
        if (container) {
            return createContainer(container, html)
        }
        return html
    }
    return text
}

interface IConversionArgs {
    markdown: string
    tokens?: ITokens[]
    type?: string
}

export const convertMarkdown = ({
    markdown,
    tokens,
    type = "title",
}: IConversionArgs): { __html: string } => {
    marked.setOptions({
        sanitize: true,
        gfm: true,
        renderer,
        // highlight: (code, lang) =>  renderWithClasses({ text: code, tokens, container: "code" }),
    })

    // renderer.blockquote = text => renderWithClasses({ text, tokens, container: "pre" })

    switch (type) {
        case "documentation":
            renderer.paragraph = text => createContainer("paragraph", text)
            break
        case "title":
        default:
            renderer.paragraph = text => renderWithClasses({ text, tokens })
    }
    const html = marked(markdown)
    return { __html: html }
}
