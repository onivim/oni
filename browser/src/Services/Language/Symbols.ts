/**
 * CodeAction.ts
 *
 */

// import * as os from "os"
import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

// import { configuration } from "./../Configuration"

// import * as UI from "./../../UI"

import { editorManager } from "./../EditorManager"
import { menuManager } from "./../Menu"

import { gotoPositionInUri } from "./Definition"
import { languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

// import * as Log from "./../../Log"

export const openWorkspaceSymbolsMenu = async () => {

    const menu = menuManager.create()

    menu.show()
    menu.setItems([{
        label: "Type to search symbols....",
    }])
    menu.setLoading(true)

    const filterTextChanged$ = menu.onFilterTextChanged.asObservable()

    menu.onItemSelected.subscribe((selectedItem: Oni.Menu.MenuOption) => {
        const key = selectedItem.label + selectedItem.detail

        const loc = keyToLocation[key]

        if (loc) {
            gotoPositionInUri(loc.uri, loc.range.start.line, loc.range.start.character)
        }

    })

    let keyToLocation: any = {}

    const getKey = (si: types.SymbolInformation) => si.name + getDetailFromSymbol(si)

    filterTextChanged$
        .debounceTime(25)
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

            keyToLocation = newItems.reduce((prev, curr) => {
                return {
                    ...prev,
                    [getKey(curr)]: curr.location,
                }
            }, {})

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
    icon: convertSymbolKindToIconName(si.kind),
})

const convertSymbolKindToIconName = (symbolKind: types.SymbolKind) => {

    switch (symbolKind) {
            case types.SymbolKind.Class:
               return "cube"
            case types.SymbolKind.Constructor:
               return "building"
            case types.SymbolKind.Enum:
               return "sitemap"
            case types.SymbolKind.Field:
               return "var"
            case types.SymbolKind.File:
               return "file"
            case types.SymbolKind.Function:
               return "cog"
            case types.SymbolKind.Interface:
               return "plug"
            case types.SymbolKind.Method:
               return "flash"
            case types.SymbolKind.Module:
               return "cubes"
            case types.SymbolKind.Property:
               return "wrench"
            case types.SymbolKind.Variable:
               return "code"
            default:
                return "question"
    }
}

export const openDocumentSymbolsMenu = async () => {
    const menu = menuManager.create()

    menu.show()
    menu.setLoading(true)

    const buffer = editorManager.activeEditor.activeBuffer

    const result: types.SymbolInformation[] = await languageManager.sendLanguageServerRequest(buffer.language, buffer.filePath, "textDocument/documentSymbol", {
        textDocument: {
            uri: Helpers.wrapPathInFileUri(buffer.filePath),
        },
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
        if (location) {
            gotoPositionInUri(location.uri, location.range.start.line, location.range.start.character)
        }
    })

    menu.setItems(options)
    menu.setLoading(false)
}
