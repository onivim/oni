/**
 * QuickInfo.ts
 *
 */

import * as types from "vscode-languageserver-types"

import { INeovimInstance } from "./../../neovim"

import { editorManager } from "./../EditorManager"
import * as LanguageManager from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

// TODO:
// - Factor out event context to something simpler
// - Remove plugin manager
export const findAllReferences = async () => {

    const activeEditor = editorManager.activeEditor

    if (!activeEditor) {
        return
    }

    const activeBuffer = activeEditor.activeBuffer

    if (!activeBuffer) {
        return
    }

    const languageManager = LanguageManager.getInstance()
    if (languageManager.isLanguageServerAvailable(activeBuffer.language)) {
        const args = { ...Helpers.bufferToTextDocumentPositionParams(activeBuffer),
                       context: {
                includeDeclaration: true,
            },
        }

        const { line, column } = activeBuffer.cursor
        const token = await activeBuffer.getTokenAt(line, column)
        const result: types.Location[] = await languageManager.sendLanguageServerRequest(activeBuffer.language, activeBuffer.filePath, "textDocument/references", args)
        showReferencesInQuickFix(token.tokenName, result, activeEditor.neovim as any)
    }
}

export const showReferencesInQuickFix = async (token: string, locations: types.Location[], neovimInstance: INeovimInstance) => {
    const convertToOneIndexedForQuickFix = (location: types.Location) => ({
        filename: Helpers.unwrapFileUriPath(location.uri),
        lnum: location.range.start.line + 1,
        col: location.range.start.character + 1,
        text: token,
    })

    const quickFixItems = locations.map((item) => convertToOneIndexedForQuickFix(item))

    neovimInstance.quickFix.setqflist(quickFixItems, ` Find All References: ${token}`)
    neovimInstance.command("copen")
    neovimInstance.command(`execute "normal! /${token}\\<cr>"`)
}
