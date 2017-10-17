/**
 * QuickInfo.ts
 *
 */

import * as types from "vscode-languageserver-types"

import { INeovimInstance } from "./../../neovim"

import { editorManager } from "./../EditorManager"
import { languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"
import { PluginManager } from "./../../Plugins/PluginManager"

// TODO:
// - Factor out event context to something simpler
// - Remove plugin manager
export const findAllReferences = async (pluginManager: PluginManager) => {

    const activeEditor = editorManager.activeEditor

    if (!activeEditor) {
        return
    }

    const activeBuffer = activeEditor.activeBuffer

    if (!activeBuffer) {
        return
    }

    if (languageManager.isLanguageServerAvailable(activeBuffer.language)) {
        const args = { ...Helpers.bufferToTextDocumentPositionParams(activeBuffer),
                       context: {
                includeDeclaration: true,
            },
        }

        const { line, column } = activeBuffer.cursor
        const token = await activeBuffer.getTokenAt(line, column)
        const result: types.Location[] = await languageManager.sendLanguageServerRequest(activeBuffer.language, activeBuffer.filePath, "textDocument/references", args)
        const references = convertLocationToReferences(token, result)
        showReferencesInQuickFix(references, activeEditor.neovim as any)
    } else {
        pluginManager.findAllReferences()
    }
}

const convertLocationToReferences = (token: string, result: types.Location[]): Oni.Plugin.ReferencesResult => {

    const locationToReferences = (location: types.Location): Oni.Plugin.ReferencesResultItem => ({
        fullPath: Helpers.unwrapFileUriPath(location.uri),
        line: location.range.start.line,
        column: location.range.start.character,
    })

    return {
        tokenName: token,
        items: result.map((l) => locationToReferences(l)),
    }
}

export const showReferencesInQuickFix = async (references: Oni.Plugin.ReferencesResult, neovimInstance: INeovimInstance) => {
    const convertToQuickFixItem = (item: Oni.Plugin.ReferencesResultItem) => ({
        filename: item.fullPath,
        lnum: item.line,
        col: item.column,
        text: item.lineText || references.tokenName,
    })

    const quickFixItems = references.items.map((item) => convertToQuickFixItem(item))

    neovimInstance.quickFix.setqflist(quickFixItems, ` Find All References: ${references.tokenName}`)
    neovimInstance.command("copen")
    neovimInstance.command(`execute "normal! /${references.tokenName}\\<cr>"`)
}
