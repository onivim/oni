/**
 * CodeAction.ts
 *
 */
import * as _ from "lodash"
import { ErrorCodes } from "vscode-jsonrpc/lib/messages"
import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"
import * as Log from "oni-core-logging"

import { LanguageManager } from "./../../Services/Language"
import { Menu, MenuManager } from "./../../Services/Menu"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { asObservable, sleep } from "./../../Utility"

import { Definition } from "./Definition"

export class Symbols {
    constructor(
        private _editor: Oni.Editor,
        private _definition: Definition,
        private _languageManager: LanguageManager,
        private _menuManager: MenuManager,
    ) {}

    public async openWorkspaceSymbolsMenu() {
        const menu = this._menuManager.create()

        menu.show()
        menu.setItems([
            {
                label: "Type to search symbols....",
            },
        ])
        menu.setLoading(true)

        const filterTextChanged$ = asObservable(menu.onFilterTextChanged)

        menu.onItemSelected.subscribe((selectedItem: Oni.Menu.MenuOption) => {
            const key = selectedItem.label + selectedItem.detail

            const loc = keyToLocation[key]

            if (loc) {
                this._definition.gotoPositionInUri(
                    loc.uri,
                    loc.range.start.line,
                    loc.range.start.character,
                )
            }
        })

        let keyToLocation: any = {}

        const getKey = (si: types.SymbolInformation) => si.name + this._getDetailFromSymbol(si)

        filterTextChanged$
            .debounceTime(25)
            .do(() => menu.setLoading(true))
            .concatMap(async (newText: string) => {
                return this._requestSymbols(this._editor.activeBuffer, "workspace/symbol", menu, {
                    query: newText,
                })
            })
            .subscribe((newItems: types.SymbolInformation[]) => {
                menu.setLoading(false)
                menu.setItems(newItems.map(item => this._symbolInfoToMenuItem(item)))

                keyToLocation = newItems.reduce((prev, curr) => {
                    return {
                        ...prev,
                        [getKey(curr)]: curr.location,
                    }
                }, {})
            })
    }

    public async openDocumentSymbolsMenu(): Promise<void> {
        const menu = this._menuManager.create()

        menu.show()
        menu.setLoading(true)

        const buffer = this._editor.activeBuffer

        const result: types.SymbolInformation[] = await this._requestSymbols(
            buffer,
            "textDocument/documentSymbol",
            menu,
        )

        const options: Oni.Menu.MenuOption[] = result.map(item => this._symbolInfoToMenuItem(item))

        const labelToLocation = result.reduce((prev, curr) => {
            return {
                ...prev,
                [curr.name]: curr.location,
            }
        }, {})

        menu.onItemSelected.subscribe(selectedItem => {
            const location: types.Location = labelToLocation[selectedItem.label]
            if (location) {
                this._definition.gotoPositionInUri(
                    location.uri,
                    location.range.start.line,
                    location.range.start.character,
                )
            }
        })

        menu.setItems(options)
        menu.setLoading(false)
    }

    private _getDetailFromSymbol(si: types.SymbolInformation): string {
        const unwrappedPath = Helpers.unwrapFileUriPath(si.location.uri)

        if (si.containerName) {
            return si.containerName + "|" + unwrappedPath
        } else {
            return unwrappedPath
        }
    }

    private _symbolInfoToMenuItem(si: types.SymbolInformation): Oni.Menu.MenuOption {
        return {
            label: si.name,
            detail: this._getDetailFromSymbol(si),
            icon: this._convertSymbolKindToIconName(si.kind),
        }
    }

    private _convertSymbolKindToIconName(symbolKind: types.SymbolKind): string {
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

    /**
     * Send a request for symbols, retrying if the server is not ready, as long as the menu is open.
     */
    private async _requestSymbols(
        buffer: Oni.Buffer,
        command: string,
        menu: Menu,
        options: any = {},
    ): Promise<types.SymbolInformation[]> {
        while (menu.isOpen()) {
            try {
                return await this._languageManager.sendLanguageServerRequest(
                    buffer.language,
                    buffer.filePath,
                    command,
                    _.extend(
                        {
                            textDocument: {
                                uri: Helpers.wrapPathInFileUri(buffer.filePath),
                            },
                        },
                        options,
                    ),
                )
            } catch (e) {
                if (e.code === ErrorCodes.ServerNotInitialized) {
                    Log.warn("[Symbols] Language server not yet initialised, trying again...")
                    await sleep(1000)
                } else {
                    throw e
                }
            }
        }
        return []
    }
}
