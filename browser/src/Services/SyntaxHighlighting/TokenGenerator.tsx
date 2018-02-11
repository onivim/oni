import * as Color from "color"
import * as path from "path"
import * as types from "vscode-languageserver-types"
import { StackElement } from "vscode-textmate"

import { editorManager } from "../../Services/EditorManager"
import { GrammarLoader } from "../../Services/SyntaxHighlighting/GrammarLoader"
import { TokenColor } from "../../Services/TokenColors"

export interface ITokens {
    [token: string]: TokenColor
}

export interface IGrammarToken {
    scopes: any
    range: types.Range
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

export interface IGrammarPerLine {
    [line: number]: IGrammarTokens
}

export interface IGrammarTokens {
    tokens: IGrammarToken[]
    ruleStack: StackElement
    line: string
}

export default async function getTokens({
    language,
    ext,
    line,
    prevState,
}: IGetTokens): Promise<IGrammarPerLine> {
    const { activeBuffer: b } = editorManager.activeEditor
    const lang = language || b.language
    const extension = ext || path.extname(b.filePath)

    const Grammar = new GrammarLoader()
    const grammar = await Grammar.getGrammarForLanguage(lang, extension)

    let tokens = null
    let ruleStack = null

    if (grammar) {
        const lines = line.split(/\n/)
        const tokensPerLine = {}
        for (let index = 0; index < lines.length; index++) {
            const tokenizeResult = grammar.tokenizeLine(lines[index], ruleStack)
            tokens = tokenizeResult.tokens.map((t: any) => ({
                range: types.Range.create(index, t.startIndex, index, t.endIndex),
                scopes: t.scopes,
            }))
            ruleStack = tokenizeResult.ruleStack
            tokensPerLine[index] = { tokens, ruleStack, line: lines[index] }
        }
        return tokensPerLine
    }
    return { 0: { tokens: [], ruleStack: null, line: null } }
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
