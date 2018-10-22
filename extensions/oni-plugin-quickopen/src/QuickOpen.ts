import { lstatSync } from "fs"

import * as path from "path"
import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import BookmarkSearch from "./BookmarksSearch"
import { getTypeFromMenuItem, QuickOpenItem, QuickOpenType } from "./QuickOpenItem"

type CreateQuery = (text: string) => Oni.Search.Query

export interface QuickOpenResult {
    items: QuickOpenItem[]
    isComplete: boolean
}

export interface IAsyncSearch {
    cancel(): void
    changeQueryText(newText): void
    onSearchResults: IEvent<QuickOpenResult>
}

class NullSearch implements IAsyncSearch {
    private _onSearchResults = new Event<QuickOpenResult>()

    public cancel(): void {
        return undefined
    }

    public changeQueryText(newText): void {
        return undefined
    }

    public get onSearchResults(): IEvent<QuickOpenResult> {
        return this._onSearchResults
    }
}

class BufferLinesSearch implements IAsyncSearch {
    private _onSearchResults = new Event<QuickOpenResult>()
    private _items: QuickOpenItem[]

    constructor(oni: Oni.Plugin.Api, lines: string[]) {
        let i = 0
        this._items = lines.map(
            s =>
                new QuickOpenItem(
                    String(++i),
                    s,
                    QuickOpenType.bufferLine,
                    oni.editors.activeEditor.activeBuffer.filePath,
                    i,
                    0,
                ),
        )
    }

    public cancel(): void {}

    public changeQueryText(newText): void {
        this._onSearchResults.dispatch({
            items: this._items,
            isComplete: true,
        })
    }

    public get onSearchResults(): IEvent<QuickOpenResult> {
        return this._onSearchResults
    }
}

class FilePathSearch implements IAsyncSearch {
    private _activeQuery: Oni.Search.Query
    private _onSearchResults = new Event<QuickOpenResult>()
    private _cached = false

    constructor(private _oni: Oni.Plugin.Api) {}

    public cancel(): void {}

    public changeQueryText(newText): void {
        if (this._cached) {
            return
        }
        this._cached = true

        const activeQuery = this._oni.search.findInPath({
            searchQuery: null,
            fileFilter: null,
            workspace: null,
        })
        activeQuery.onSearchResults.subscribe(result => {
            const items = result.items.map(i => FilePathSearch.toQuickOpenItem(i))
            this._onSearchResults.dispatch({
                items,
                isComplete: result.isComplete,
            })
        })
        activeQuery.start()
    }

    public get onSearchResults(): IEvent<QuickOpenResult> {
        return this._onSearchResults
    }

    private static toQuickOpenItem(item: Oni.Search.ResultItem): QuickOpenItem {
        return new QuickOpenItem(
            path.basename(item.fileName),
            path.dirname(item.fileName),
            QuickOpenType.file,
            item.fileName,
            item.line,
            item.column,
        )
    }
}

class FileContentSearch implements IAsyncSearch {
    private _activeQuery: Oni.Search.Query
    private _onSearchResults = new Event<QuickOpenResult>()

    constructor(private _oni: Oni.Plugin.Api) {
        this._activeQuery = this._oni.search.nullSearch
    }

    public cancel(): void {
        this._activeQuery.cancel()
        this._activeQuery = this._oni.search.nullSearch
    }

    public changeQueryText(newText): void {
        this._activeQuery.cancel()

        if (!newText || newText.length < 1) {
            this._onSearchResults.dispatch({
                items: [],
                isComplete: true,
            })
            return
        }

        const searchParams = {
            searchQuery: newText,
            fileFilter: null,
            workspace: null,
        }
        this._activeQuery = this._oni.search.findInFile(searchParams)
        this._activeQuery.onSearchResults.subscribe(result => {
            this._onSearchResults.dispatch({
                items: result.items.map(i => FileContentSearch.toQuickOpenItem(i)),
                isComplete: result.isComplete,
            })
        })
        this._activeQuery.start()
    }

    public get onSearchResults(): IEvent<QuickOpenResult> {
        return this._onSearchResults
    }

    private static toQuickOpenItem(item: Oni.Search.ResultItem): QuickOpenItem {
        return new QuickOpenItem(
            item.text,
            path.basename(item.fileName),
            QuickOpenType.file,
            item.fileName,
            item.line,
            item.column,
        )
    }
}

function getHome(): string {
    return process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"]
}

export class QuickOpen {
    private _menu: Oni.Menu.MenuInstance
    private _searcher: IAsyncSearch = new NullSearch()
    private _seenItems: Set<string> = new Set()
    private _itemsFound: QuickOpenItem[] = []
    private _bookmarksSearch: BookmarkSearch

    constructor(private _oni: Oni.Plugin.Api) {
        this._menu = _oni.menu.create()

        this._menu.onHide.subscribe(() => {
            this._searcher.cancel()
        })

        this._bookmarksSearch = new BookmarkSearch(this._oni)

        this._menu.onFilterTextChanged.subscribe(newFilter => {
            if (this._menu.isOpen()) {
                const timeout = window.setTimeout(() => {
                    this._menu.setLoading(true)
                }, 200)
                this._searcher.changeQueryText(newFilter)
                if (timeout) {
                    window.clearTimeout(timeout)
                }
            } else {
                this._searcher.cancel()
            }
        })

        this._menu.onItemSelected.subscribe(() => {
            this.open(this.getDefaultOpenMode())
        })
    }

    public isOpen(): boolean {
        return this._menu.isOpen()
    }

    public async open(mode: Oni.FileOpenMode): Promise<void> {
        const selectedItem = this._menu.selectedItem
        if (!selectedItem) {
            return
        }

        const { activeWorkspace } = this._oni.workspace
        const basePath = activeWorkspace ? [activeWorkspace] : []
        const pathArgs = basePath.concat([selectedItem.metadata["path"]])
        const fullPath = path.join(...pathArgs).replace("~", getHome())

        this._seenItems.add(selectedItem.metadata["hash"])

        const qoType = getTypeFromMenuItem(selectedItem)
        switch (qoType) {
            case QuickOpenType.bookmarkHelp: {
                this._oni.commands.executeCommand("oni.config.openConfigJs")
                break
            }

            case QuickOpenType.folderHelp: {
                this._oni.commands.executeCommand("workspace.openFolder")
                break
            }

            case QuickOpenType.bufferLine: {
                if (mode !== Oni.FileOpenMode.Edit) {
                    const openOptions = { openMode: mode }
                    const path = this._oni.editors.activeEditor.activeBuffer.filePath
                    await this._oni.editors.openFile(path, openOptions)
                }
                await this._oni.editors.activeEditor.neovim.command(`${selectedItem.label}`)
                break
            }

            case QuickOpenType.folder: {
                this._oni.workspace.changeDirectory(fullPath)
                break
            }

            case QuickOpenType.bookmark: {
                // TODO: add an option to automatically open the quick open menu
                // Also look at https://github.com/isaacs/node-glob, as a means
                // of allowing users to specify globs for their bookmarks
                await this._bookmarksSearch.handleBookmark(selectedItem)
                break
            }

            case QuickOpenType.file: {
                const line = parseInt(selectedItem.metadata["line"], 10)
                const column = parseInt(selectedItem.metadata["column"], 10)

                const offsetedLine = line > 0 ? line - 1 : 0
                const offsetedColumn = column > 0 ? column - 1 : 0

                await this._oni.editors.openFile(fullPath, { openMode: mode })
                await this._oni.editors.activeEditor.activeBuffer.setCursorPosition(
                    offsetedLine,
                    offsetedColumn,
                )
                break
            }

            default: {
                this._oni.log(`Error: unhandled QO type: ${qoType} (${QuickOpenType[qoType]})`)
                break
            }
        }

        this._menu.hide()
    }

    public setToQuickFix = async () => {
        this._oni.populateQuickFix(this._itemsFound.map(item => item.toQuickFixItem()))
        this._menu.hide()
    }

    public openFileWithAltAction = () => {
        const mode: Oni.FileOpenMode = this._oni.configuration.getValue(
            "editor.quickOpen.alternativeOpenMode",
        )
        this.open(mode)
    }

    public searchFileByContent = async () => {
        const filterName = "none" // TODO: Use a filter like `regex` (needs a few adjustments)
        const searcher = new FileContentSearch(this._oni)
        await this.search(searcher, filterName)
    }

    public searchFileByPath = async () => {
        const filterName = this._oni.configuration.getValue<string>(
            "editor.quickOpen.filterStrategy",
            "vscode",
        )
        const searchEngine = this.isInstallDirectoryOrHome()
            ? this._bookmarksSearch
            : new FilePathSearch(this._oni)
        await this.search(searchEngine, filterName)
    }

    public showBufferLines = async () => {
        const lines = await this._oni.editors.activeEditor.activeBuffer.getLines()
        await this.search(new BufferLinesSearch(this._oni, lines), "fuse")
    }

    public showBookmarks = async () => {
        await this.search(this._bookmarksSearch, "vscode")
    }

    private search = async (searcher: IAsyncSearch, filterName: string) => {
        this._searcher.cancel()
        const filterFunction = this._oni.filter.getByName(filterName)
        this._menu.setFilterFunction(filterFunction)
        this._searcher = searcher
        searcher.onSearchResults.subscribe(result => {
            this._itemsFound = result.items
            if (result.isComplete) {
                this._menu.setLoading(false)
            }
            const pinned = (e: QuickOpenItem) => this._seenItems.has(e.hash)
            const menuItems = result.items.map(e => e.toMenuItem(this._oni, pinned(e)))
            this._menu.setItems(menuItems)
        })
        this._menu.show()
        this._searcher.changeQueryText("")
    }

    private getDefaultOpenMode(): Oni.FileOpenMode {
        const legacy = this._oni.configuration.getValue("editor.quickOpen.defaultOpenMode", null)
        // the value of the defaultOpenMode is a numerical enum that includes 0 so we check that the value
        // is a number and that number is an option in the file open mode enum
        if (!isNaN(legacy) && legacy in Oni.FileOpenMode) {
            return legacy
        }

        const defaultOpenMode = this._oni.configuration.getValue(
            "quickOpen.defaultOpenMode",
            Oni.FileOpenMode.NewTab,
        )

        return defaultOpenMode
    }

    private isInstallDirectoryOrHome() {
        // Offer to open folder/bookmark (Basically user hasn't opened a folder yet)
        const cwd = process.cwd()
        const installationDir = path.dirname(process.execPath)
        const homeDir = getHome()
        return cwd === installationDir || cwd === homeDir
    }
}
