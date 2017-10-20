/**
 * QuickInfo.ts
 *
 */

import * as types from "vscode-languageserver-types"

import { editorManager } from "./../EditorManager"
import { languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import * as UI from "./../../UI"

const getActiveBuffer = (): Oni.Buffer => {
    const activeEditor = editorManager.activeEditor

    if (!activeEditor) {
        return null
    }

    const activeBuffer = activeEditor.activeBuffer

    if (!activeBuffer) {
        return null
    }

    return activeBuffer
}

// TODO:
// - Factor out event context to something simpler
// - Remove plugin manager
export const getDefinition = async () => {

    const activeBuffer = getActiveBuffer()

    if (activeBuffer && languageManager.isLanguageServerAvailable(activeBuffer.language)) {
        const args = { ...Helpers.bufferToTextDocumentPositionParams(activeBuffer) }

        const { line, column } = activeBuffer.cursor
        const token = await activeBuffer.getTokenAt(line, column)
        const result: types.Location = await languageManager.sendLanguageServerRequest(activeBuffer.language, activeBuffer.filePath, "textDocument/definition", args)

        UI.Actions.setDefinition(activeBuffer.filePath, line, column, token, result)
    }
}

export const gotoDefinitionUnderCursor = async () => {
    // alert("Going to definition!")

    const activeDefinition = UI.Selectors.getActiveDefinition()

    if (!activeDefinition) {
        return
    }

    const { uri, range } = activeDefinition.definitionLocation

    const line = range.start.line
    const column = range.start.character

    const activeEditor = editorManager.activeEditor
    const filePath = Helpers.unwrapFileUriPath(uri)
    activeEditor.neovim.command("tabnew! " + filePath)
    activeEditor.neovim.command(`cal cursor(${line}, ${column})`)
    activeEditor.neovim.command("norm zz")

                // this._neovimInstance.command(`cal cursor(${line}, ${column})`)
                // this._neovimInstance.command("norm zz")

}
