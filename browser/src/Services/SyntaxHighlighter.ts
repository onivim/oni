/**
 * SyntaxHighlighter.ts
 */

import { IBuffer } from "./../neovim/Buffer"
import { INeovimInstance } from "./../NeovimInstance"
import { PluginManager } from "./../Plugins/PluginManager"

export class SyntaxHighlighter {
    private _neovimInstance: INeovimInstance
    private _pluginManager: PluginManager

    constructor(neovimInstance: INeovimInstance, pluginManager: PluginManager) {
        this._neovimInstance = neovimInstance
        this._pluginManager = pluginManager

        this._pluginManager.on("set-syntax-highlights", (payload: any) => {
            let buf: IBuffer = <any> null // FIXME: null
            this._neovimInstance.getCurrentBuffer()
                .then((buffer) => buf = buffer)
                .then(() => this._neovimInstance.eval("expand('%:p')"))
                .then((res) => {
                    if (res !== payload.file) {
                        throw "Syntax highlighting was for different file."
                    }

                    // const key = payload.key
                    const highlights: Oni.Plugin.SyntaxHighlight[] = payload.highlights

                    const highlightKindToKeywords = {}

                    highlights.forEach((h) => {

                        if (!h.highlightKind) {
                            console.warn("Undefined highlight: ", h)
                            return
                        }

                        const currentValue = highlightKindToKeywords[h.highlightKind] || ""
                        highlightKindToKeywords[h.highlightKind] = currentValue + " " + h.token

                    })

                    return highlightKindToKeywords
                })
                .then((highlightDictionary) => {
                    Object.keys(highlightDictionary).forEach((k) => {

                        const highlight = k
                        const keywords = highlightDictionary[k]
                        this._neovimInstance.command("syntax keyword " + highlight + keywords)
                    })
                })
        })
    }
}
