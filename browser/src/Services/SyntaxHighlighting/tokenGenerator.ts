import * as path from "path"
import * as Color from "color"
import * as types from "vscode-languageserver-types"
import { StackElement } from "vscode-textmate"

import { editorManager } from "../../Services/EditorManager"
import { GrammarLoader } from "../../Services/SyntaxHighlighting/GrammarLoader"
import { configuration, ITokenColorsSetting } from "../Configuration"
import { HighlightGroupId } from "./Definitions"
import { ISyntaxHighlightTokenInfo } from "./SyntaxHighlightingStore"

export interface ITokens {
    [token: string]: ITokenColorsSetting
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

export async function getColorForToken(tokens: ISyntaxHighlightTokenInfo[]) {
    return mapTokensToHighlights(tokens)
}

export function mapTokensToHighlights(tokens: ISyntaxHighlightTokenInfo[]): any[] {
    const mapTokenToHighlight = (token: ISyntaxHighlightTokenInfo) => ({
        highlightGroup: getHighlightGroupFromScope(token.scopes),
        range: token.range,
    })

    const highlights = tokens.map(mapTokenToHighlight).filter(t => !!t.highlightGroup)
    return highlights
}

export function getHighlightGroupFromScope(scopes: string[]): HighlightGroupId {
    const configurationColors = configuration.getValue("editor.tokenColors")
    const tokenNames = Object.keys(configurationColors)

    for (const scope of scopes) {
        const match = tokenNames.find(c => scope.indexOf(c) === 0)

        const matchingRule = configurationColors[match]

        if (matchingRule) {
            // TODO: Convert to highlight group id
            return matchingRule.settings.fallback
        }
    }

    return null
}

const highlightOrDefault = (color: number) => (color ? Color(color).hex() : null)
export const createChildFromScopeName = (
    result: ITokens,
    scopeName: string,
    { italic, bold, foreground, background }: IHighlight,
) => {
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

export const vimHighlightScopes = {
    identifier: [
        "variable.object",
        "variable.language",
        "variable.parameter",
        "support.variable",
        "meta.interface",
        "variable.other.readwrite",
        "meta.object.type",
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
        "meta.namespace",
        "meta.type",
        "support.variable.property.dom",
    ],
    define: ["meta.import"],
    statement: ["source"],
    normal: ["meta.brace"],
    // keyword: [],
    // comment: [],
    // foldbraces: [],
    // preproc: [],
}
