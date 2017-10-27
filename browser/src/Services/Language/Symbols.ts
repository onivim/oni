/**
 * CodeAction.ts
 *
 */

// import * as os from "os"
import * as types from "vscode-languageserver-types"

// import { configuration } from "./../Configuration"

// import * as UI from "./../../UI"

import { menuManager } from "./../Menu"
import { editorManager } from "./../EditorManager"

import { gotoPositionInUri } from "./Definition"
import { languageManager } from "./LanguageManager"

// import * as Log from "./../../Log"

export const openWorkspaceSymbolsMenu = async () => {

    const menu = menuManager.create()

    menu.show()
    menu.setItems([{
        label: "Type to search symbols....",
    }])
    menu.setLoading(true)

    const filterTextChanged$ = menu.onFilterTextChanged.asObservable()

    filterTextChanged$
        .auditTime(50)
        .do(() => menu.setLoading(true))
        .concatMap(async (newText: string) => {
            const buffer = editorManager.activeEditor.activeBuffer
            const symbols: types.SymbolInformation[] = await languageManager.sendLanguageServerRequest(buffer.language, buffer.filePath, "workspace/symbol", {
                textDocument: {
                    uri: Helpers.wrapPathInFileUri(buffer.filePath),
                },
                query: newText,
            })
            return symbols
        })
        .subscribe((newItems: types.SymbolInformation[]) => {
            menu.setLoading(false)
            menu.setItems(newItems.map(symbolInfoToMenuItem))
        })
}

const getDetailFromSymbol = (si: types.SymbolInformation) => {

    const unwrappedPath = Helpers.unwrapFileUriPath(si.location.uri)

    if (si.containerName) {
        return si.containerName + "|" + unwrappedPath
    } else {
        return unwrappedPath
    }
}

const symbolInfoToMenuItem = (si: types.SymbolInformation) => ({
    label: si.name,
    detail: getDetailFromSymbol(si),
})

export const openDocumentSymbolsMenu = async () => {
    const menu = menuManager.create()

    menu.show()
    menu.setLoading(true)

    const buffer = editorManager.activeEditor.activeBuffer

    const result: types.SymbolInformation[] = await languageManager.sendLanguageServerRequest(buffer.language, buffer.filePath, "textDocument/documentSymbol", {
        textDocument: {
            uri: Helpers.wrapPathInFileUri(buffer.filePath)
        }
    })

    const options: Oni.Menu.MenuOption[] = result.map(symbolInfoToMenuItem)

    const labelToLocation = result.reduce((prev, curr) => {
        return {
            ...prev,
            [curr.name]: curr.location,
        }
    }, {})

    menu.onItemSelected.subscribe((selectedItem) => {
        const location: types.Location = labelToLocation[selectedItem.label]
        if(location) {
            gotoPositionInUri(location.uri, location.range.start.line, location.range.start.character)
        }
    })

    menu.setItems(options)
    menu.setLoading(false)
}

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

// let codeActionsContextMenu = contextMenuManager.create()

// let lastCommands: types.Command[] = []
// let lastFileInfo: any = {}

// codeActionsContextMenu.onItemSelected.subscribe(async (selectedItem) => {

//     const commandName = selectedItem.data
//     await languageManager.sendLanguageServerRequest(lastFileInfo.language, lastFileInfo.filePath, "workspace/executeCommand", { command: commandName })
// })

// export const checkCodeActions = async (language: string, filePath: string, line: number, column: number) => {

//     if (languageManager.isLanguageServerAvailable(language)) {
//         const result: types.Command[] = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/codeAction",
//             Helpers.eventContextToCodeActionParams(filePath, line, column))

//         // TODO:
//         if (result) {
//             console.dir(result)
//         }

//         lastCommands = result
//         lastFileInfo = {
//             language,
//             filePath,
//         }
//     }
// }

// export const expandCodeActions = () => {
//     if (!lastCommands || !lastCommands.length) {
//         return
//     }

//     const mapCommandsToItem = (command: types.Command) => ({
//         label: command.title,
//         icon: "wrench",
//         data: command.command,
//     })

//     const contextMenuItems = lastCommands.map((c) => mapCommandsToItem(c))

//     codeActionsContextMenu.show(contextMenuItems)
// }
