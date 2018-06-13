import { lstatSync } from "fs"

import * as path from "path"
import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import { QuickOpenItem, QuickOpenType, isType } from "./QuickOpenItem"

/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */
interface QuickFixEntry {
    filename: string
    lnum: number
    col: number
    text: string
}
interface IMenuOptionWithHighlights extends Oni.Menu.MenuOption {
    labelHighlights: number[]
    detailHighlights: number[]
}
type IMenuFilter = (options: any[], searchString: string) => IMenuOptionWithHighlights[]
interface IMenuFilters {
    getDefault(): IMenuFilter
    getByName(name: string): IMenuFilter
}
namespace SearchApi {
    export interface ResultItem {
        fileName: string
        line: number
        column: number
        text: string
    }
    export interface Result {
        items: ResultItem[]
        isComplete: boolean
    }
    export interface Query {
        onSearchResults: IEvent<Result>
        start(): void
        cancel(): void
    }
    export interface Options {
        searchQuery: string
        fileFilter: string
        workspace: string
    }
    export interface ISearch {
        nullSearch: Query
        findInFile(opts: Options): Query
        findInPath(opts: Options): Query
    }
}
interface ApiNext {
    search: SearchApi.ISearch
    populateQuickFix(entries: QuickFixEntry[]): void

    // TODO: Move to oni-api under menu
    filter: IMenuFilters
}
/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */
/* !!! DELETE !!! */

type CreateQuery = (text: string) => SearchApi.Query

interface QuickOpenResult {
    items: QuickOpenItem[]
    isComplete: boolean
}

interface IAsyncSearch {
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

class BookmarkSearch implements IAsyncSearch {
    private _onSearchResults = new Event<QuickOpenResult>()
    private _bookmarkItems: QuickOpenItem[]

    constructor(oni: Oni.Plugin.Api) {
        const bookmarks = oni.configuration.getValue<string[]>("oni.bookmarks", [])

        // TODO: Consider adding folders as well (recursive async with ignores/excludes)

        this._bookmarkItems = [
            new QuickOpenItem("Open Folder", "", QuickOpenType.folderHelp),
            ...bookmarks.map(f => new QuickOpenItem(f, "", QuickOpenType.bookmark)),
            new QuickOpenItem(
                "Open configuration",
                "For adding a bookmark",
                QuickOpenType.bookmarkHelp,
            ),
        ]
    }

    public cancel(): void {}

    public changeQueryText(newText): void {
        this._onSearchResults.dispatch({
            items: this._bookmarkItems,
            isComplete: true,
        })
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
    private _activeQuery: SearchApi.Query
    private _onSearchResults = new Event<QuickOpenResult>()
    private _cached = false

    constructor(private _oni: Oni.Plugin.Api, private _oniNext: ApiNext) {}

    public cancel(): void {}

    public changeQueryText(newText): void {
        if (this._cached) {
            return
        }
        this._cached = true

        const activeQuery = this._oniNext.search.findInPath({
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

    private static toQuickOpenItem(i: SearchApi.ResultItem): QuickOpenItem {
        return new QuickOpenItem(
            path.basename(i.fileName),
            path.dirname(i.fileName),
            QuickOpenType.file,
            i.fileName,
            i.line,
            i.column,
        )
    }
}

class FileContentSearch implements IAsyncSearch {
    private _activeQuery: SearchApi.Query
    private _onSearchResults = new Event<QuickOpenResult>()

    constructor(private _oni: Oni.Plugin.Api, private _oniNext: ApiNext) {
        this._activeQuery = this._oniNext.search.nullSearch
    }

    public cancel(): void {
        this._activeQuery.cancel()
        this._activeQuery = this._oniNext.search.nullSearch
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

        ;(this._activeQuery = this._oniNext.search.findInFile({
            searchQuery: newText,
            fileFilter: null,
            workspace: null,
        })),
            this._activeQuery.onSearchResults.subscribe(result => {
                const items = result.items.map(i => FileContentSearch.toQuickOpenItem(i))
                this._onSearchResults.dispatch({
                    items,
                    isComplete: result.isComplete,
                })
            })
        this._activeQuery.start()
    }

    public get onSearchResults(): IEvent<QuickOpenResult> {
        return this._onSearchResults
    }

    private static toQuickOpenItem(i: SearchApi.ResultItem): QuickOpenItem {
        return new QuickOpenItem(
            i.text,
            path.basename(i.fileName),
            QuickOpenType.file,
            i.fileName,
            i.line,
            i.column,
        )
    }
}

function getHome(): string {
    return process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"]
}

export class QuickOpen {
    private _menu: Oni.Menu.MenuInstance
    private _searcher: IAsyncSearch = new NullSearch()
    private _oniNext: ApiNext // TODO: Remove
    private _seenItems: string[] = []
    private _itemsFound: QuickOpenItem[] = []

    constructor(private _oni: Oni.Plugin.Api) {
        const typelessOni: any = _oni
        this._oniNext = typelessOni

        this._menu = _oni.menu.create()

        this._menu.onHide.subscribe(() => {
            this._searcher.cancel()
        })

        this._menu.onFilterTextChanged.subscribe((newFilter: any) => {
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

        this._menu.onItemSelected.subscribe((selectedItem: any) => {
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

        if (isType(selectedItem, QuickOpenType.bookmarkHelp)) {
            this._oni.commands.executeCommand("oni.config.openConfigJs")
        } else if (isType(selectedItem, QuickOpenType.folderHelp)) {
            this._oni.commands.executeCommand("workspace.openFolder")
        } else if (isType(selectedItem, QuickOpenType.bufferLine)) {
            if (mode !== Oni.FileOpenMode.Edit) {
                await this._oni.editors.openFile(
                    this._oni.editors.activeEditor.activeBuffer.filePath,
                    {
                        openMode: mode,
                    },
                )
            }
            await this._oni.editors.activeEditor.neovim.command(`${selectedItem.label}`)
        } else {
            this._seenItems.push(selectedItem.metadata["hash"])

            const { activeWorkspace } = this._oni.workspace
            const pathArgs = (activeWorkspace ? [activeWorkspace] : []).concat([
                selectedItem.metadata["path"],
            ])
            const fullPath = path.join(...pathArgs).replace("~", getHome())
            await this._oni.editors.openFile(fullPath, { openMode: mode })

            if (isType(selectedItem, QuickOpenType.folder)) {
                this._oni.workspace.changeDirectory(fullPath)
            } else if (isType(selectedItem, QuickOpenType.bookmark)) {
                // If we are bookmark, and we open a file, the open it's dirname
                // If we are a directory, open it.
                const dirPath = lstatSync(fullPath).isDirectory() ? fullPath : selectedItem.detail
                this._oni.workspace.changeDirectory(dirPath)
            }
        }

        this._menu.hide()
    }

    public async setToQuickFix() {
        this._oniNext.populateQuickFix(this._itemsFound.map(item => item.toQuickFixItem()))
        this._menu.hide()
    }

    public openFileWithAltAction(): void {
        const mode: Oni.FileOpenMode = this._oni.configuration.getValue(
            "editor.quickOpen.alternativeOpenMode",
        )
        this.open(mode)
    }

    public async searchFileByContent() {
        const filterName = "none"
        const searcher = new FileContentSearch(
            this._oni,
            this._oniNext, // TODO: Remove
        )
        await this.search(searcher, filterName)
    }

    public async searchFileByPath() {
        const filterName = this._oni.configuration.getValue<string>(
            "editor.quickOpen.filterStrategy",
            "vscode",
        )
        const searchEngine = this.isInstallDirectoryOrHome()
            ? new BookmarkSearch(this._oni)
            : new FilePathSearch(
                  this._oni,
                  this._oniNext, // TODO: Remove
              )
        await this.search(searchEngine, filterName)
    }

    public async showBufferLines() {
        const lines = await this._oni.editors.activeEditor.activeBuffer.getLines()
        await this.search(new BufferLinesSearch(this._oni, lines), "fuse")
    }

    private async search(searcher: IAsyncSearch, filterName: string) {
        this._searcher.cancel()
        const filterFunction = this._oniNext.filter.getByName(filterName)
        this._menu.setFilterFunction(filterFunction)
        this._searcher = searcher
        searcher.onSearchResults.subscribe((result: QuickOpenResult) => {
            this._itemsFound = result.items
            if (result.isComplete) {
                this._menu.setLoading(false)
            }
            const menuItems = result.items.map(e => e.toMenuItem(this._oni, this._seenItems))
            this._menu.setItems(menuItems)
        })
        this._menu.show()
        this._searcher.changeQueryText("")
    }

    private getDefaultOpenMode(): Oni.FileOpenMode {
        const legacy = this._oni.configuration.getValue("editor.quickOpen.defaultOpenMode", null)
        if (legacy) {
            return legacy
        }
        return this._oni.configuration.getValue(
            "quickOpen.defaultOpenMode",
            Oni.FileOpenMode.NewTab,
        )
    }

    private isInstallDirectoryOrHome() {
        // Offer to open folder/bookmark (Basically user hasn't opened a folder yet)
        const cwd = process.cwd()
        const installationDir = path.dirname(process.execPath)
        const homeDir = getHome()
        return cwd === installationDir || cwd === homeDir
    }
}
