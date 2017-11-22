/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as flatten from "lodash/flatten"

import { editorManager } from "./../EditorManager"
import { HighlightGroupId, HighlightInfo  } from "./Definitions"
import { ISyntaxHighlightLineInfo, ISyntaxHighlightState } from "./SyntaxHighlightingStore"

import { Store, Unsubscribe } from "redux"

// SyntaxHighlightReconciler
//
// Essentially a renderer / reconciler, that will push
// highlight calls to the active buffer based on the active
// window and viewport
export class SyntaxHighlightReconciler {

    private _unsubscribe: Unsubscribe

    constructor(
        private _store: Store<ISyntaxHighlightState>,
    ) {

        // TODO: Also listen to viewport change event

        this._unsubscribe = this._store.subscribe(() => {

            const state = this._store.getState()

            const activeBuffer: any = editorManager.activeEditor.activeBuffer

            const bufferId = activeBuffer.id

            const currentHighlightState = state.bufferToHighlights[bufferId]

            if (currentHighlightState && currentHighlightState.lines) {
                const lineNumbers = Object.keys(currentHighlightState.lines)

                const allHighlights = lineNumbers.map((li) => {
                    const line: ISyntaxHighlightLineInfo = currentHighlightState.lines[li]
                    return line.tokens
                })

                // TODO: Only set highlights for tokens in the viewable portion
                const consolidatedTokens = flatten(allHighlights)

                const tokensWithHighlights: any = consolidatedTokens.map((t): HighlightInfo => ({
                    highlightGroup: this._getHighlightGroupFromScope(t.scopes),
                    range: t.range,
                }))

                activeBuffer.setHighlights(tokensWithHighlights)
            }

        })

    }

    private _getHighlightGroupFromScope(/* TODO */scopes: any): HighlightGroupId {
        return "Function"
    }

    public dispose(): void {
        if (this._unsubscribe) {
            this._unsubscribe()
            this._unsubscribe = null
        }
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

// export const getRegistry = () => {

//     const registry = new Registry()
//     const grammar = registry.loadGrammarFromPathSync("C:/oni/languages/javascript/syntaxes/JavaScript.tmLanguage.json")

//     return grammar
// }
