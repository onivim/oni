/**
 * Rename.tsx
 */

// import * as React from "react"

import * as types from "vscode-languageserver-types"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"
// import * as UI from "./../../UI"

import { editorManager } from "./../EditorManager"
// import { workspace } from "./../Workspace"

import { languageManager } from "./LanguageManager"

export const formatDocument = async () => {

    const activeBuffer = editorManager.activeEditor.activeBuffer

    const args = {
        textDocument: {
            uri: Helpers.wrapPathInFileUri(activeBuffer.filePath),
        },
        range: types.Range.create(0, 0, activeBuffer.lineCount - 1, 0),
    }

    let result: types.TextEdit[] = null
    try {
        result = await languageManager.sendLanguageServerRequest(activeBuffer.language, activeBuffer.filePath, "textDocument/rangeFormatting", args)
    } catch (ex) { }

    if (result) {

        await activeBuffer.applyTextEdits(result)
    }
}
