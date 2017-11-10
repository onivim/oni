/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as os from "os"

import { Observable } from "rxjs/Observable"
// import { Registry } from "vscode-textmate"
// import * as types from "vscode-languageserver-types"

// import { editorManager } from "./../EditorManager"
import { NeovimInstance } from "./../../neovim"

import { createSyntaxHighlightStore } from "./SyntaxHighlightingStore"

import { SyntaxHighlightReconciler } from "./SyntaxHighlightReconciler"

export const registerTextMateHighlighter = (bufferUpdate$: Observable<Oni.EditorBufferChangedEventArgs>, neovimInstance: NeovimInstance) => {

    const syntaxHighlightStore = createSyntaxHighlightStore()

    const subscription = bufferUpdate$.subscribe(async (evt: Oni.EditorBufferChangedEventArgs) => {
        const firstChange = evt.contentChanges[0]
        if (!firstChange.range && !firstChange.rangeLength) {

            const lines = firstChange.text.split(os.EOL)
            syntaxHighlightStore.dispatch({
                type: "SYNTAX_UPDATE_BUFFER",
                lines,
            })
        } else {
            // Incremental update
            syntaxHighlightStore.dispatch({
                type: "SYNTAX_UPDATE_BUFFER_LINE",
                lineNumber: firstChange.range.start.line,
                lines: firstChange.text,
            })
        }
    })

    const reconciler = new SyntaxHighlightReconciler(syntaxHighlightStore)

    return () => {
        subscription.unsubscribe()
        reconciler.dispose()
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
