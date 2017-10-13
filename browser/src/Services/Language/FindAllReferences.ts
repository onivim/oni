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
              }
          }
        const result: types.Location[] = await languageManager.sendLanguageServerRequest(activeBuffer.language, activeBuffer.filePath, "textDocument/references", args)
        const references = convertLocationToReferences(result)
        showReferencesInQuickFix(references, activeEditor.neovim as any)
    } else {
        pluginManager.findAllReferences()
    }
}

const convertLocationToReferences = (result: types.Location[]): Oni.Plugin.ReferencesResult => {

    // TODO: Get symbol under cursor

    // const getToken = (buffer: string[], line: number, character: number): string => {
    //     const lineContents = buffer[line]

    //     const tokenStart = getLastMatchingCharacter(lineContents, character, -1, characterMatchRegex)
    //     const tokenEnd = getLastMatchingCharacter(lineContents, character, 1, characterMatchRegex)

    //     return lineContents.substring(tokenStart, tokenEnd + 1)
    // }

    // const getLastMatchingCharacter = (lineContents: string, character: number, dir: number, regex: RegExp) => {
    //     while (character >= 0 && character < lineContents.length) {
    //         if (!lineContents[character].match(regex)) {
    //             return character - dir
    //         }

    //         character += dir
    //     }

    //     return character
    // }

    const locationToReferences = (location: types.Location): Oni.Plugin.ReferencesResultItem => ({
        fullPath: Helpers.unwrapFileUriPath(location.uri),
        line: location.range.start.line,
        column: location.range.start.character,
    })

    return {
        tokenName: "TODO",
        // tokenName: getToken(this._currentBuffer, textDocumentPosition.line - 1, textDocumentPosition.column - 1),
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

