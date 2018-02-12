import { unescape } from "lodash"
import * as marked from "marked"

import { IGrammarPerLine, IGrammarToken } from "./../../Services/SyntaxHighlighting/TokenGenerator"

const renderer = new marked.Renderer()

interface IRendererArgs {
    tokens?: IGrammarPerLine
    text: string
    element?: TextElement
    container?: TextElement
}

interface Symbols {
    [symbol: string]: string[]
}

export const scopesToString = (scope: string[]) => {
    if (scope) {
        return scope
            .map(s => {
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
export function escapeRegExp(str: string) {
    // NOTE This does NOT escape the "|" operator as it's needed for the Reg Exp
    // Also does not escape "\-" as hypenated tokens can be found
    return str.replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\n\r]/g, "\\$&")
}

type TextElement = "code" | "pre" | "p" | "span"
export const createContainer = (type: TextElement, content: string) => {
    switch (type) {
        case "code":
            return `<code class="marked-code">${content}</code>
            `
        case "pre":
            return `<pre class="marked-pre">${content}</pre>`
        case "p":
            return `<${type} class="marked-paragraph">${content}</${type}>`
        default:
            return content
    }
}

interface WrapTokenArgs {
    tokens: IGrammarToken[]
    element: string
    text: string
}
export function wrapTokens({ tokens, element, text }: WrapTokenArgs): string {
    const symbols: Symbols = tokens.reduce((acc, token) => {
        const symbol = text.substring(token.range.start.character, token.range.end.character)
        acc[symbol] = token.scopes
        return acc
    }, {})

    const symbolNames = Object.keys(symbols)
    const banned = ["\n", "\r", " ", "|"]
    const filteredNames = symbolNames.filter(str => !banned.includes(str))
    // Check if a word is alphabetical if so make sure to match full words only
    // if not alphabetical escape the string
    const wholeWordMatch = filteredNames.map(
        str => (/^[A-Za-z]/.test(str) ? `\\b${str}\\b` : escapeRegExp(str)),
    )
    const symbolRegex = new RegExp("(" + wholeWordMatch.join("|") + ")", "g")
    const html = text.replace(symbolRegex, (match, ...args) => {
        const className = scopesToString(symbols[match])
        return `<${element} class="marked ${className}">${match}</${element}>`
    })
    return html
}

/**
 * Takes a list of tokens which contain ranges, the text from marked (3rd party lib)
 * uses a reg exp to replace all matching tokens with an element with a class that is styled
 * else where
 * @returns {string}
 */
export function renderWithClasses({
    tokens,
    text,
    element = "span",
    container = "p",
}: IRendererArgs) {
    // This is critical because marked's renderer refuses to leave html untouched so it converts
    // special chars to html entities which are rendered correctly in react
    const unescapedText = unescape(text)

    if (tokens) {
        const tokenValues = Object.values(tokens)
        const tokenLines = new Set(tokenValues.map(l => l.line))
        const parts = new Set(unescapedText.split("\n"))
        // Find common lines in lines to render and lines in tokenisation map
        const intersection = new Set([...tokenLines].filter(x => parts.has(x)))
        const lineToToken = tokenValues.reduce((acc, t) => {
            acc[t.line] = t
            return acc
        }, {})
        if (intersection.size) {
            const html = [...intersection].reduce((acc, match) => {
                return `${(acc += wrapTokens({
                    tokens: lineToToken[match].tokens,
                    element,
                    text: lineToToken[match].line,
                }))}\n`
            }, "")
            if (container) {
                return createContainer(container, html)
            }
            return html
        }
    }
    return text
}

interface IConversionArgs {
    markdown: string
    tokens?: IGrammarPerLine
    type?: string
}

export const convertMarkdown = ({ markdown, tokens, type = "title" }: IConversionArgs): string => {
    marked.setOptions({
        sanitize: true,
        gfm: true,
        renderer,
        highlight: (code, lang) => {
            return renderWithClasses({ text: code, tokens, container: "code" })
        },
    })

    switch (type) {
        case "documentation":
            renderer.paragraph = text => createContainer("p", text)
            break
        case "title":
        default:
            renderer.paragraph = text => renderWithClasses({ text, tokens })
            renderer.blockquote = text => renderWithClasses({ text, tokens, container: "pre" })
    }
    const html = marked(markdown)
    return html
}
