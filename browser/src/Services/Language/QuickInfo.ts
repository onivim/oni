/**
 * QuickInfo.ts
 *
 */

// import * as os from "os"
import * as types from "vscode-languageserver-types"

// import { configuration } from "./../Configuration"

// import * as UI from "./../../UI"

import { editorManager } from "./../EditorManager"

import { languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

// TODO:
// - Factor out event context to something simpler
// - Remove plugin manager
export const getQuickInfo = async (): Promise<types.Hover> => {
    const buffer = editorManager.activeEditor.activeBuffer
    const { language, filePath } = buffer
    const { line, column } = buffer.cursor

    if (languageManager.isLanguageServerAvailable(language)) {

        const args = {
                textDocument: {
                    uri: Helpers.wrapPathInFileUri(filePath),
                },
                position: {
                    line,
                    character: column,
                },
        }

        let result: types.Hover = null
        try {
            result = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/hover", args)
        } catch (ex) { }

        return result
    } else {
        return null
    }
}
