/**
 * QuickInfo.ts
 *
 */

import * as types from "vscode-languageserver-types"

import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { editorManager } from "./../EditorManager"

import { languageManager } from "./LanguageManager"

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
        } catch (ex) { Log.debug(ex) }

        return result
    } else {
        return null
    }
}
