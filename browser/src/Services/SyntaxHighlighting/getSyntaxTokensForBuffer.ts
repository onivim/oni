/**
 * getSyntaxTokensForBuffer
 *
 * Helper method to handle getting tokens for a particular buffer
 */

import * as types from "vscode-languageserver-types"

import { IGrammar, Registry } from "vscode-textmate"

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

export const getSyntaxTokensForBuffer = async (grammar: IGrammar, originalState: IBufferSyntaxHighlightState): Promise<Partial<IBufferSyntaxHighlightState>> => {


    // startLine = initialRuleStack ? startLine : 0

    // Don't bother refreshing the whole state... just go to the end of the viewport
    const totalLines = editorManager.activeEditor.activeBuffer.lineCount
    const bufferLines = await editorManager.activeEditor.activeBuffer.getLines(0, totalLines)
    //const endLine = Math.min(originalState.bottomVisibleLine + 1, totalLines)
    const endLine = totalLines

    const outputLines: { [bufferId: string]: ISyntaxHighlightLineInfo } = { }

    // Iterate from top to bottom for unchanged lines
    const oldLines = originalState.lines

    let startLine = 0
    for(let i = 0; i < bufferLines.length; i++) {

        if (!oldLines[i]) {
            break
        }

        const updatedLine = bufferLines[i]

        const oldLine = oldLines[i].line

        // Line hasn't changed, so just copy over old line and bump the version
        if (updatedLine === oldLine) {
            outputLines[i] = {
                ...oldLines[i],
            }
        }

        startLine++
    }

    let ruleStack = null

    if (oldLines[startLine] && oldLines[startLine].ruleStack) {
        ruleStack = oldLines[startLine].ruleStack
    }

    for (let i = startLine; i < endLine; i++) {
        const r = grammar.tokenizeLine(bufferLines[i], ruleStack)

        const tokens = r.tokens.map((t: any) => ({
            range: types.Range.create(i, t.startIndex, i, t.endIndex),
            scopes: t.scopes,
        }))

        ruleStack = r.ruleStack

        outputLines[i] = {
            line: bufferLines[i],
            ruleStack,
            tokens,
            dirty: false,
        }
    }

    // Invalidate remaining lines
    for (let i = endLine; i < totalLines; i++) {
        outputLines[i] = {
            line: null,
            ruleStack: null,
            tokens: [],
            dirty: true,
        }
    }

    return {
        bufferId: editorManager.activeEditor.activeBuffer.id,
        lines: outputLines,
    }
}
