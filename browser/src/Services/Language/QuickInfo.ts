/**
 * QuickInfo.ts
 *
 */

import * as types from "vscode-languageserver-types"

import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { configuration } from "./../Configuration"
import { editorManager } from "./../EditorManager"

import { languageManager } from "./LanguageManager"

import { IResultWithPosition } from "./LanguageClientTypes"

export const getQuickInfo = async (): Promise<IResultWithPosition<types.Hover>> => {
    const buffer = editorManager.activeEditor.activeBuffer
    const { language, filePath } = buffer
    const { line, column } = buffer.cursor

    if (!configuration.getValue("editor.quickInfo.enabled")) {
        return null
    }

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

        let result: IResultWithPosition<types.Hover> = null
        try {
            const hoverResult = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/hover", args)
            result = {
                position: types.Position.create(line, column),
                result: hoverResult,
            }
        } catch (ex) { Log.debug(ex) }

        return result
    } else {
        return null
    }
}
