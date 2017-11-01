/**
 * SyntaxHighlighting.ts
 *
 * Handles enhanced syntax highlighting
 */

import * as os from "os"

import { Observable } from "rxjs/Observable"
import { Registry } from "vscode-textmate"
import * as types from "vscode-languageserver-types"

import { NeovimInstance } from "./../../neovim"

export const registerTextMateHighlighter = (bufferUpdate$: Observable<Oni.EditorBufferChangedEventArgs>, neovimInstance: NeovimInstance) => {

    bufferUpdate$.subscribe((evt: Oni.EditorBufferChangedEventArgs) => {


        const firstChange = evt.contentChanges[0]
        
        if (!firstChange.range && !firstChange.rangeLength) {
            
            const grammar = getRegistry()

            var ruleStack = null

            console.warn("Updating highlights!")

            let tokens: any[] = []


            // TODO: Evaluate performance
            const lines = firstChange.text.split(os.EOL)
            for (var i = 0; i < lines.length; i++) {
                var r = grammar.tokenizeLine(lines[i], ruleStack)

                const tokensWithPosition = r.tokens.map((t) => ({
                    range: types.Range.create(i, t.startIndex, i, t.endIndex),
                    scopes: t.scopes
                }))

                tokens = tokens.concat(tokensWithPosition)

                ruleStack = r.ruleStack
            }

            console.dir(tokens)
        }


    })

}

export const getRegistry = () => {

    const registry = new Registry()
    const grammar = registry.loadGrammarFromPathSync("C:/oni/languages/javascript/syntaxes/JavaScript.tmLanguage.json")

    return grammar
}
