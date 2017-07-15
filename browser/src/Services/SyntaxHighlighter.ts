/**
 * SyntaxHighlighter.ts
 */

import { IBuffer, INeovimInstance } from "./../neovim"
import { PluginManager } from "./../Plugins/PluginManager"

import { SymbolKind } from "vscode-languageserver-types"

const symbolKindToHighlightString = (kind: SymbolKind): string => {
    switch (kind) {
        case SymbolKind.File:
        case SymbolKind.Module:
        case SymbolKind.Namespace:
        case SymbolKind.Package:
            return "Include"
        case SymbolKind.Class:
        case SymbolKind.Interface:
        case SymbolKind.Enum:
            return "Type"
        case SymbolKind.Constructor:
        case SymbolKind.Method:
        case SymbolKind.Function:
            return "Function"
        case SymbolKind.Property:
        case SymbolKind.Array:
            return "Special"
        case SymbolKind.Variable:
        case SymbolKind.Field:
            return "Identifier"
        case SymbolKind.Constant:
            return "Constant"
        case SymbolKind.Number:
            return "Number"
        case SymbolKind.String:
            return "String"
        case SymbolKind.Boolean:
            return "Boolean"
        default:
            return "Identifier"
    }
}

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

                        const highlightKind = symbolKindToHighlightString(h.highlightKind)

                        const currentValue = highlightKindToKeywords[highlightKind] || ""
                        highlightKindToKeywords[highlightKind] = currentValue + " " + h.token
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
