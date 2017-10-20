/**
 * Completion.ts
 */

// import * as os from "os"
import * as types from "vscode-languageserver-types"

// import { configuration } from "./../Configuration"

import * as UI from "./../../UI"

import { languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"
import { PluginManager } from "./../../Plugins/PluginManager"

// TODO:
// - Factor out event context to something simpler
// - Remove plugin manager
export const checkForCompletions = async (evt: Oni.EventContext, pluginManager: PluginManager) => {
    if (languageManager.isLanguageServerAvailable(evt.filetype)) {
        const result = await languageManager.sendLanguageServerRequest(evt.filetype, evt.bufferFullPath, "textDocument/completion",
            Helpers.eventContextToTextDocumentPositionParams(evt))

        const items = getCompletionItems(result)

        if (!items) {
            return
        }

        const completions = items.map((i) => ({
            label: i.label,
            detail: i.detail,
            documentation: getCompletionDocumentation(i),
            kind: i.kind,
            insertText: i.insertText,
        }))

        UI.Actions.showCompletions(evt.bufferFullPath, evt.line - 1, evt.column - 1, completions || [])

        // console.dir(result)
        // debugger

    }
}
    const getCompletionItems = (items: types.CompletionItem[] | types.CompletionList): types.CompletionItem[]  => {
        if (!items) {
            return []
        }

        if (Array.isArray(items)) {
            return items
        } else {
            return items.items || []
        }
    }

    const getCompletionDocumentation = (item: types.CompletionItem): string | null=> {
        if (item.documentation) {
            return item.documentation
        } else if (item.data && item.data.documentation) {
            return item.data.documentation
        } else {
            return null
        }
    }
