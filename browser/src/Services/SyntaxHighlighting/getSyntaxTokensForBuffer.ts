/**
 * getSyntaxTokensForBuffer
 *
 * Helper method to handle getting tokens for a particular buffer
 */

import * as types from "vscode-languageserver-types"

import { Registry, StackElement } from "vscode-textmate"

import { editorManager } from "./../EditorManager"

import { IBufferSyntaxHighlightState, ISyntaxHighlightLineInfo } from "./SyntaxHighlightingStore"

let _grammar: any

export const getRegistry = () => {

    if (_grammar) {
        return _grammar
    }

    const registry = new Registry()
    _grammar = registry.loadGrammarFromPathSync("C:/oni/languages/javascript/syntaxes/JavaScript.tmLanguage.json")

    return _grammar
}

export const getSyntaxTokensForBuffer = async (startLine: number, initialRuleStack: StackElement): Promise<IBufferSyntaxHighlightState> => {

    startLine = initialRuleStack ? startLine : 0

    const totalLines = editorManager.activeEditor.activeBuffer.lineCount
    const bufferLines = await editorManager.activeEditor.activeBuffer.getLines(startLine, totalLines)

    const grammar = getRegistry()

    const lines: { [bufferId: string]: ISyntaxHighlightLineInfo } = { }

    let ruleStack = initialRuleStack
    for (let i = startLine; i < bufferLines.length; i++) {
        const r = grammar.tokenizeLine(bufferLines[i], ruleStack)

        const tokens = r.tokens.map((t: any) => ({
            range: types.Range.create(i, t.startIndex, i, t.endIndex),
            scopes: t.scopes,
        }))

        ruleStack = r.ruleStack

        lines[i] = {
            ruleStack,
            tokens,
            version: editorManager.activeEditor.activeBuffer.version,
        }
    }

    return {
        bufferId: editorManager.activeEditor.activeBuffer.id,
        lines,
    }
}
