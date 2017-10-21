/**
 * SignatureHelp.ts
 *
 */

import * as types from "vscode-languageserver-types"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"
import * as UI from "./../../UI"

import { editorManager } from "./../EditorManager"
import { languageManager } from "./LanguageManager"

export const showSignatureHelp = async (evt: Oni.EventContext) => {
    if (languageManager.isLanguageServerAvailable(evt.filetype)) {

        const line = evt.line - 1
        const column = evt.column - 1

        const buffer = editorManager.activeEditor.activeBuffer
        const currentLine = await buffer.getLines(line, line + 1)

        const requestColumn = getSignatureHelpTriggerColumn(currentLine[0], column, ["("])

        if (requestColumn < 0) {
            return
        }

        const args = {
            textDocument: {
                uri: Helpers.wrapPathInFileUri(evt.bufferFullPath),
            },
            position: {
                line,
                character: column,
            },
        }

        const result: types.SignatureHelp = await languageManager.sendLanguageServerRequest(evt.filetype, evt.bufferFullPath, "textDocument/signatureHelp", args)

        UI.Actions.showSignatureHelp(evt.bufferFullPath, line, requestColumn, result)
    }
}

// TODO: `getSignatureHelpTriggerColumn` rename to `getNearestTriggerCharacter`
export const getSignatureHelpTriggerColumn = (line: string, character: number, triggerCharacters: string[]): number => {

    let idx = character
    while (idx >= 0) {
        if (line[idx] === triggerCharacters[0]) {
            break
        }

        idx--
    }

    return idx
}
