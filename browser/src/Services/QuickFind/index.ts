/**
 * QuickFind.ts
 *
 * Manages the quick find menu
 */

import { CommandManager } from "./../CommandManager"
import { EditorManager } from "./../EditorManager"
import { Workspace } from "./../Workspace"

import { Menu, MenuManager } from "./../Menu"

import {
    ISearchProvider,
    ISearchQuery,
    ISearchResult,
    NullSearchQuery,
    QuickFixSearchResultsViewer,
    RipGrepSearchProvider,
} from "./../Search/SearchProvider"

class QuickFind {
    private _activeQuery: ISearchQuery = new NullSearchQuery()
    private _searchProvider: ISearchProvider

    private _menu: Menu

    constructor(
        private _editorManager: EditorManager,
        menuManager: MenuManager,
        private _workspace: Workspace,
    ) {
        this._searchProvider = new RipGrepSearchProvider()
        this._menu = menuManager.create()

        this._menu.onHide.subscribe(() => {
            this._activeQuery.cancel()
        })

        this._menu.onFilterTextChanged.subscribe((newFilter: any) => {
            this._activeQuery.cancel()

            if (!newFilter || newFilter.length < 1 || !this._menu.isOpen()) {
                this.setResult({
                    items: [],
                    isComplete: true,
                })
            } else {
                this._activeQuery = this._searchProvider.search({
                    searchQuery: newFilter,
                    fileFilter: null,
                    workspace: this._workspace.activeWorkspace,
                })
                this._activeQuery.start()
                this._activeQuery.onSearchCompleted.subscribe(result => {
                    this.setResult(result)
                })
            }
        })
    }

    public async show() {
        this._menu.show()
    }

    private setResult(result: ISearchResult): void {
        new QuickFixSearchResultsViewer(this._editorManager).showResult(result)
    }
}

let _instance: QuickFind = null

export function activate(
    commandManager: CommandManager,
    menuManager: MenuManager,
    editorManager: EditorManager,
    workspace: Workspace,
): void {
    _instance = new QuickFind(editorManager, menuManager, workspace)

    commandManager.registerCommand({
        command: "quickFind.show",
        name: null,
        detail: null,
        execute: () => _instance.show(),
        enabled: () => !menuManager.isMenuOpen(),
    })
}
