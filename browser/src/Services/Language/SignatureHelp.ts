/**
 * SignatureHelp.ts
 *
 */

import * as types from "vscode-languageserver-types"

import * as UI from "./../../UI"

import { languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"
import { PluginManager } from "./../../Plugins/PluginManager"

// TODO:
// - Factor out event context to something simpler
// - Remove plugin manager
export const showSignatureHelp = async (evt: Oni.EventContext, pluginManager: PluginManager) => {
    if (languageManager.isLanguageServerAvailable(evt.filetype)) {
        const result: types.SignatureHelp = await languageManager.sendLanguageServerRequest(evt.filetype, evt.bufferFullPath, "textDocument/signatureHelp",
            Helpers.eventContextToTextDocumentPositionParams(evt))

        UI.Actions.showSignatureHelp(evt.bufferFullPath, evt.line - 1, evt.column - 1, result)
    } else {
        pluginManager.checkSignatureHelp(evt)
    }
}
