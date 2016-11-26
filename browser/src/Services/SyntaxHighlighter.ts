/**
 * SyntaxHighlighter.ts
 */

import { INeovimInstance } from "./../NeovimInstance"
import { IBuffer } from "./../neovim/Buffer"

import { BufferInfo, PluginManager } from "./../Plugins/PluginManager"

export class SyntaxHighlighter {
    private _neovimInstance: INeovimInstance
    private _pluginManager: PluginManager

    constructor(neovimInstance: INeovimInstance, pluginManager: PluginManager) {
        this._neovimInstance = neovimInstance
        this._pluginManager = pluginManager

        this._pluginManager.on("set-syntax-highlights",  (payload) => {

            var buf: IBuffer = null
            this._neovimInstance.getCurrentBuffer()
                .then((buffer) => buf = buffer)
                .then(() => this._neovimInstance.eval("expand('%:p')"))
                .then((res) => {
                    if(res !== payload.file) {
                        throw "Syntax highlighting was for different file."
                    }

                    const key = payload.key
                    const highlights: Oni.Plugin.SyntaxHighlight[] = payload.highlights

                    highlights.forEach((h) => {

                        if (!h.highlightKind) {
                            console.warn("Undefined highlight: ", h)
                            return
                        }

                        this._neovimInstance.command("syntax keyword " + h.highlightKind + " " + h.token)
                    })
                })
        })
    }
}
