/**
 * CodeAction.ts
 *
 */

// import * as os from "os"
// import * as types from "vscode-languageserver-types"

// import { configuration } from "./../Configuration"

// import * as UI from "./../../UI"

import { languageManager } from "./LanguageManager"

import * as Log from "./../../Log"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

// TODO:
// - Factor out event context to something simpler
// - Remove plugin manager
export const checkCodeActions = async (evt: Oni.EventContext) => {
    if (languageManager.isLanguageServerAvailable(evt.filetype)) {
        const result = await languageManager.sendLanguageServerRequest(evt.filetype, evt.bufferFullPath, "textDocument/codeAction",
            Helpers.eventContextToCodeActionParams(evt))

        // TODO:
        if (result) {
            Log.info(result)
        }
    }
}
