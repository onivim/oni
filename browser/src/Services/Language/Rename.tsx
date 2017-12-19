/**
 * Rename.tsx
 */

import * as React from "react"

import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"
import * as UI from "./../../UI"

import { editorManager } from "./../EditorManager"
import { workspace } from "./../Workspace"

import * as LanguageManager from "./LanguageManager"

const _renameToolTipName = "rename-tool-tip"
let _isRenameActive = false
let _isRenameCommitted = false

import { RenameView } from "./RenameView"

export const isRenameActive = () => {
    return _isRenameActive
}

export const startRename = async () => {
    if (_isRenameActive) {
        return
    }

    const activeBuffer = editorManager.activeEditor.activeBuffer

    const activeToken = await activeBuffer.getTokenAt(activeBuffer.cursor.line, activeBuffer.cursor.column)

    if (!activeToken || !activeToken.tokenName) {
        return
    }

    _isRenameActive = true

    UI.Actions.showToolTip(_renameToolTipName, <RenameView onComplete={onRenameClosed} tokenName={activeToken.tokenName} />, {
        position: null,
        openDirection: 2,
        onDismiss: () => cancelRename(),
    })
}

export const commitRename = () => {
    Log.verbose("[RENAME] Committing rename")
    _isRenameCommitted = true
    _isRenameActive = false
    closeToolTip()
}

export const cancelRename = () => {
    Log.verbose("[RENAME] Cancelling")
    _isRenameCommitted = false
    closeToolTip()
}

export const onRenameClosed = (newValue: string) => {
    Log.verbose("[RENAME] onRenameClosed")
    if (_isRenameCommitted) {
        _isRenameCommitted = false
        doRename(newValue)
    }
    closeToolTip()
}

const closeToolTip = () => {
    Log.verbose("[RENAME] closeToolTip")
    _isRenameActive = false
    UI.Actions.hideToolTip(_renameToolTipName)
}

export const doRename = async (newName: string): Promise<void> => {

    const activeBuffer = editorManager.activeEditor.activeBuffer

    const args = {
        textDocument: {
            uri: Helpers.wrapPathInFileUri(activeBuffer.filePath),
        },
        position: {
            line: activeBuffer.cursor.line,
            character: activeBuffer.cursor.column,
        },
        newName,
    }

    const languageManager = LanguageManager.getInstance()
    let result = null
    try {
        result = await languageManager.sendLanguageServerRequest(activeBuffer.language, activeBuffer.filePath, "textDocument/rename", args)
        } catch (ex) { Log.debug(ex) }

    if (result) {
        await workspace.applyEdits(result)
    }
}
