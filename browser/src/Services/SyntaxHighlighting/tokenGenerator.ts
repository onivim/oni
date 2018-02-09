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
    const { activeBuffer: b } = editorManager.activeEditor
    const lang = language || b.language
    const extension = ext || path.extname(b.filePath)
    let tokens = null
    let ruleStack = null

    const Grammar = new GrammarLoader()
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
