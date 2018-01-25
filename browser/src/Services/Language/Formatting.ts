/**
 * Rename.tsx
 */

import * as types from "vscode-languageserver-types"

import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { editorManager } from "./../EditorManager"

import * as LanguageManager from "./LanguageManager"

export const format = async () => {
    const activeBuffer = editorManager.activeEditor.activeBuffer

    const capabilities = await LanguageManager.getInstance().getCapabilitiesForLanguage(
        activeBuffer.language,
    )

    if (capabilities.documentFormattingProvider) {
        await formatDocument()
    } else if (capabilities.documentRangeFormattingProvider) {
        await rangeFormatDocument()
    } else {
        Log.warn("No formatting provider available")
    }
}

export const formatDocument = async () => {
    const activeBuffer = editorManager.activeEditor.activeBuffer

    const args = {
        textDocument: {
            uri: Helpers.wrapPathInFileUri(activeBuffer.filePath),
        },
    }

    let result: types.TextEdit[] = null
    try {
        result = await LanguageManager.getInstance().sendLanguageServerRequest(
            activeBuffer.language,
            activeBuffer.filePath,
            "textDocument/formatting",
            args,
        )
    } catch (ex) {
        Log.warn(ex)
    }

    if (result) {
        await activeBuffer.applyTextEdits(result)
    }
}

export const rangeFormatDocument = async () => {
    const activeBuffer = editorManager.activeEditor.activeBuffer

    const args = {
        textDocument: {
            uri: Helpers.wrapPathInFileUri(activeBuffer.filePath),
        },
        range: types.Range.create(0, 0, activeBuffer.lineCount - 1, 0),
    }

    let result: types.TextEdit[] = null
    try {
        result = await LanguageManager.getInstance().sendLanguageServerRequest(
            activeBuffer.language,
            activeBuffer.filePath,
            "textDocument/rangeFormatting",
            args,
        )
    } catch (ex) {
        Log.warn(ex)
    }

    if (result) {
        await activeBuffer.applyTextEdits(result)
    }
}
