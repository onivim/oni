/**
 * QuickInfo.ts
 *
 */

import * as types from "vscode-languageserver-types"

import { editorManager } from "./../EditorManager"
import { languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"
import { PluginManager } from "./../../Plugins/PluginManager"

import * as UI from "./../../UI"

// TODO:
// - Factor out event context to something simpler
// - Remove plugin manager
export const getDefinition = async (pluginManager: PluginManager) => {

    const activeEditor = editorManager.activeEditor

    if (!activeEditor) {
        return
    }

    const activeBuffer = activeEditor.activeBuffer

    if (!activeBuffer) {
        return
    }

    if (languageManager.isLanguageServerAvailable(activeBuffer.language)) {
        const args = { ...Helpers.bufferToTextDocumentPositionParams(activeBuffer) }

        const { line, column } = activeBuffer.cursor
        const token = await activeBuffer.getTokenAt(line, column)
        const result: types.Location = await languageManager.sendLanguageServerRequest(activeBuffer.language, activeBuffer.filePath, "textDocument/definition", args)

        UI.Actions.setDefinition(activeBuffer.filePath, line, column, token, result)
    } else {
        pluginManager.getDefinition()
    }
}
