import { unescape } from "lodash"
import * as marked from "marked"

import * as Log from "./../../Log"
import { IGrammarPerLine, IGrammarToken } from "./../../Services/SyntaxHighlighting/TokenGenerator"

// tslint:disable-next-line
const { default: DOMPurify } = require("dompurify")

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
        case "pre":
            return `<pre class="marked-pre">${content}</pre>`
        case "p":
            return `<${type} class="marked-paragraph">${content}</${type}>`
        case "code":
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
    try {
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
    } catch (e) {
        Log.warn(`Regex construction failed with: ${e.message}`)
        return text
    }
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
    // special chars to html entities
    const unescapedText = unescape(text)
    const whiteSpaceForCode = (line: string, code: boolean) => (code ? line.trim() : line)

    if (tokens) {
        const isCodeBlock = container === "code"
        const tokenValues = Object.values(tokens)
        const tokenLines = tokenValues.map(l => whiteSpaceForCode(l.line, isCodeBlock))
        const parts = unescapedText.split("\n")
        // Find common lines in lines to render and lines in tokenisation map
        const intersection = tokenLines.filter(x => parts.includes(x))
        const lineToToken = tokenValues.reduce((acc, t) => {
            const key = whiteSpaceForCode(t.line, isCodeBlock)
            acc[key] = t
            return acc
        }, {})
        if (intersection.length) {
            const html = intersection.reduce((acc, match) => {
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

const purifyConfig = {
    FORBID_TAGS: ["img", "script"],
}

/**
 * Takes a markdown string and defines a custom renderer then for the element type and returns an html string
 *
 * @name convertMarkdown
 * @function
 * @param {string} {markdown A Markdown String
 * @param {Object} tokens An Object of lines with tokens for each line
 * @param {string} type the section of the quickfix being processed
 * @returns {string} An html string
 */
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
            renderer.html = text => DOMPurify.sanitize(text, purifyConfig)
            renderer.paragraph = text =>
                createContainer("p", DOMPurify.sanitize(text, purifyConfig))

            break
        case "title":
        default:
            renderer.html = htmlString => DOMPurify.sanitize(htmlString, purifyConfig)
            renderer.paragraph = text => {
                const stringWithClasses = renderWithClasses({ text, tokens })
                return DOMPurify.sanitize(stringWithClasses, purifyConfig)
            }
            renderer.blockquote = text => {
                const stringWithClasses = renderWithClasses({
                    text,
                    tokens,
                    container: "pre",
                })
                return DOMPurify.sanitize(stringWithClasses, purifyConfig)
            }
    }

    const html = marked(markdown)
    return html
}
