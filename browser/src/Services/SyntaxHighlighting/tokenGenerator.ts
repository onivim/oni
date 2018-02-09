import * as Color from "color"
import * as path from "path"
// import { mergeAll } from "ramda"
import * as types from "vscode-languageserver-types"
import { StackElement } from "vscode-textmate"

import { editorManager } from "../../Services/EditorManager"
import { GrammarLoader } from "../../Services/SyntaxHighlighting/GrammarLoader"
import { TokenColor } from "../../Services/TokenColors"

export interface ITokens {
    [token: string]: TokenColor
}

export interface IHighlight {
    foreground: number
    background?: number
    bold?: boolean
    italic?: boolean
}

interface IGetTokens {
    line: string
    prevState: StackElement
    language: string
    ext?: string
}

export const vimHighlightScopes = {
    identifier: [
        "variable.object",
        "variable.language",
        "variable.parameter",
        "support.variable",
        "variable.other.readwrite",
    ],
    function: [
        "punctuation.definition.string.beginning",
        "punctuation.definition.string.end",
        "punctuation.separator.continuation",
        "punctuation.separator.comma",
        "punctuation.terminator",
        "punctuation.terminator",
        "entity.name",
        "entity.name.type.enum",
        "entity.name.type.interface",
        "support.function",
    ],
    constant: [
        "entity.other",
        "keyword.control",
        "keyword.control.import",
        "storage.type",
        "storage.type.interface",
        "storage.type.enum",
        "storage.type.interface",
        "variable.other.constant",
        "variable.other.object",
        "variable.other.property",
    ],
    type: [
        "support.class.builtin",
        "support.type.primitive",
        "support.class",
        "support.variable.property.dom",
    ],
    statement: ["source"],
}

export default async function getTokens({ language, ext, line, prevState }: IGetTokens) {
    const Grammar = new GrammarLoader()
    const { activeBuffer: b } = editorManager.activeEditor
    const lang = language || b.language
    const extension = ext || path.extname(b.filePath)
    let tokens = null
    let ruleStack = null

    const grammar = await Grammar.getGrammarForLanguage(lang, extension)

    if (grammar) {
        const tokenizeResult = grammar.tokenizeLine(line, prevState)
        tokens = tokenizeResult.tokens.map((t: any) => ({
            range: types.Range.create(0, t.startIndex, 0, t.endIndex),
            scopes: t.scopes,
        }))
        ruleStack = tokenizeResult.ruleStack
    }
    return { ruleStack, tokens }
}

const highlightOrDefault = (color: number) => (color ? Color(color).hex() : null)

export function createChildFromScopeName(
    result: ITokens,
    scopeName: string,
    { italic, bold, foreground, background }: IHighlight,
) {
    return {
        ...result,
        [scopeName]: {
            scope: [scopeName],
            settings: {
                italic,
                bold,
                foreground: highlightOrDefault(foreground),
                background: highlightOrDefault(background),
            },
        },
    }
}

/**
 * populateScopes
 * [WIP]: this fn should create new tokens with colors based   on the parent scope
 * @param {ITokens} tokens
 * @returns {IEditorTokens}
 */
// export function populateScopes(tokens: ITokens) {
//     const emptyHighlight: IHighlight = {
//         foreground: null,
//         background: null,
//         italic: null,
//         bold: null,
//     }
//     const scopes = Object.keys(tokens)
//     const newScopes = scopes.reduce((result, scopeName) => {
//         const parent = tokens[scopeName]
//         if (parent && parent.scope && parent.scope[0]) {
//             const children = parent.scope.reduce((acc, name) => {
//                 if (name) {
//                     const newScope = createChildFromScopeName(result, name, emptyHighlight)
//                     acc[name] = newScope
//                 }
//                 return acc
//             }, {})
//             const isEmpty = !Object.keys(children).length
//             if (!isEmpty) {
//                 mergeAll([result, tokens, children])
//             }
//         }
//         return result
//     }, {})
//     return { "editor.tokenColors": newScopes }
// }
