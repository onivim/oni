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
    element?: string
    container?: string
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

function escapeRegExp(str: string) {
    // NOTE This does NOT escape the "|" operator as it's needed for the Reg Exp
    // Also does not escape "\-" as hypenated tokes can be found
    return str.replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$\n\r]/g, "\\$&")
}

const createContainer = (type: string, content: string) => {
    switch (type) {
        case "code":
        case "pre":
            return `
                <pre class="marked-pre">
                    <code class="marked-code">
                        ${content}
                    <code>
                 </pre>
            `
        case "paragraph":
            return `<${type} class="marked-paragraph">${content}<${type}>`
        default:
            return content
    }
}

const renderWithClasses = ({
    tokens,
    text,
    element = "span",
    container = "paragraph",
}: IRendererArgs) => {
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
        // "\b" tell the regex to use word boundaries to match not partial matches
        // FIXME: RegExp is breaking on certain chars
        const symbolRegex = new RegExp("(" + escapeRegExp(filteredNames.join("|")) + ")", "g")
        // tslint:disable
        console.group("Regex ====================")
        console.log("filteredNames: ", filteredNames)
        console.log("symbolNames: ", symbolNames)
        console.log("symbolRegex: ", symbolRegex)
        console.group("matches..............")
        const html = unescapedText.replace(symbolRegex, (match, ...args) => {
            console.log("match in replacer: ", match)
            const className = scopesToString(symbols[match])
            return `<${element} class="marked ${className}">${match}</${element}>`
        })
        console.groupEnd()
        console.groupEnd()
        // tslint:enable
        return createContainer(container, html)
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
    })

    switch (type) {
        case "documentation":
            renderer.code = text => renderWithClasses({ text, tokens, container: "pre" })
            renderer.paragraph = text => `<p>${text}</p>`
            break
        case "title":
        default:
            renderer.code = text => renderWithClasses({ text, tokens, container: "pre" })
            renderer.paragraph = text => renderWithClasses({ text, tokens })
    }

    const html = marked(markdown)
    return { __html: html }
}
