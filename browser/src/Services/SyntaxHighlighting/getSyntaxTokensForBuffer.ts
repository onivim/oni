/**
 * getSyntaxTokensForBuffer
 *
 * Helper method to handle getting tokens for a particular buffer
 */

import * as types from "vscode-languageserver-types"

import { Registry, StackElement } from "vscode-textmate"

import { editorManager } from "./../EditorManager"

import { IBufferSyntaxHighlightState, ISyntaxHighlightLineInfo } from "./SyntaxHighlightingStore"

export const getRegistry = () => {

    const registry = new Registry()
    const grammar = registry.loadGrammarFromPathSync("C:/oni/languages/javascript/syntaxes/JavaScript.tmLanguage.json")

    return grammar
}

export const getSyntaxTokensForBuffer = async (startLine: number, initialRuleStack: StackElement): Promise<IBufferSyntaxHighlightState> => {

    startLine = initialRuleStack ? startLine : 0

    const totalLines = editorManager.activeEditor.activeBuffer.lineCount
    const bufferLines = await editorManager.activeEditor.activeBuffer.getLines(startLine, totalLines)

    const grammar = getRegistry()

    const lines: { [bufferId: string]: ISyntaxHighlightLineInfo } = { }

    let ruleStack = initialRuleStack
    for (let i = startLine; i < bufferLines.length; i++) {
        var r = grammar.tokenizeLine(bufferLines[i], ruleStack)

        const tokens = r.tokens.map((t) => ({
            range: types.Range.create(i, t.startIndex, i, t.endIndex),
            scopes: t.scopes
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
        lines
    }
}
            // const grammar = getRegistry()

            // var ruleStack = null

            // console.warn("Updating highlights!")

            // let tokens: any[] = []


            // for (var i = 0; i < lines.length; i++) {
            //     var r = grammar.tokenizeLine(lines[i], ruleStack)

            //     const tokensWithPosition = r.tokens.map((t) => ({
            //         range: types.Range.create(i, t.startIndex, i, t.endIndex),
            //         scopes: t.scopes
            //     }))

            //     tokens = tokens.concat(tokensWithPosition)

            //     ruleStack = r.ruleStack
            // }

            // const bufferId = editorManager.activeEditor.activeBuffer.id

            // const keys = Object.keys(scopeToVimHighlightGroup)
            // tokens.forEach(async (t) => {

                // const matchingKey = keys.find((k) => t.

                // const scopes: string[] = t.scopes
                // if (scopes.find((f) => f.indexOf("support.class.builtin") === 0)) {
                //     const result: any = await neovimInstance.request("nvim_buf_add_highlight", [parseInt(bufferId, 10), 0, "Type", t.range.start.line, t.range.start.character, t.range.end.character])
                //     console.dir(result)
                // } else if (scopes.find((f) => f.indexOf("variable") === 0)) {
                //     const result: any = await neovimInstance.request("nvim_buf_add_highlight", [parseInt(bufferId, 10), 0, "Identifier", t.range.start.line, t.range.start.character, t.range.end.character])
                //     console.dir(result)
                // } else if (scopes.find((f) => f.indexOf("entity.name.function") === 0)) {
                //     const result: any = await neovimInstance.request("nvim_buf_add_highlight", [parseInt(bufferId, 10), 0, "Function", t.range.start.line, t.range.start.character, t.range.end.character])
                //     console.dir(result)
                // } 

            // })
            // console.dir(tokens)
        // }
    // })
// }

// const scopeToVimHighlightGroup = {
//     "variable": "Identifier",
//     "entity.name.function": "Function",
//     "keyword": "Keyword",
//     "constant.character": "Character",
//     "constant.other": "Constant",
//     "constant.language": "COnstant",

// }
