/**
 * Search
 *
 * Service for workspace-wide search
 */

import { Event, IEvent } from "oni-types"

import { FinderProcess } from "./QuickOpen/FinderProcess"
import * as RipGrep from "./QuickOpen/RipGrep"

export interface ISearchResultItem {
    fileName: string
    line: number
    column: number
    text: string
}

export interface ISearchResult {
    items: ISearchResultItem[]
    isComplete: boolean
}

export interface ISearchQuery {
    onSearchStarted: IEvent<void>
    onSearchCompleted: IEvent<ISearchResult>

    start(): void
    cancel(): void
}

export interface ISearchOptions {
    searchQuery: string
    fileFilter: string
    workspace: string
}

export interface ISearchProvider {
    search(opts: ISearchOptions): ISearchQuery
}

export class RipGrepSearchProvider {
    public search(opts: ISearchOptions): ISearchQuery {
        return new RipGrepSearchQuery(opts)
    }
}

export const getArgumentsFromSearchOptions = (searchOpts: ISearchOptions): string[] => {
    const args = []

    args.push("--vimgrep")
    args.push("-e")
    args.push(searchOpts.searchQuery)

    if (searchOpts.fileFilter) {
        args.push("-g")
        args.push(searchOpts.fileFilter)
    }

    args.push("--")
    args.push(".")

    return args
}

// Command format:
// E:\\oni\\node_modules\\oni-ripgrep\\bin\\rg.exe" --vimgrep -e test -g *.tsx -- .', [], { shell: true, cwd: "E:\\oni" }).stdout.toString()

export const ripGrepLineToSearchResultItem = (ripGrepResult: string): ISearchResultItem => {
    if (!ripGrepResult || ripGrepResult.length === 0) {
        return null
    }

    const splitString = ripGrepResult.split(":")

    if (splitString.length < 4) {
        return null
    }

    const [fileName, line, column, ...result] = splitString

    const text = result.join(":")

    const ret: ISearchResultItem = {
        fileName,
        line: parseInt(line, 10),
        column: parseInt(column, 10),
        text,
    }
    return ret
}

export class RipGrepSearchQuery {
    private _onSearchStartedEvent = new Event<void>()
    private _onSearchCompletedEvent = new Event<ISearchResult>()
    private _finderProcess: FinderProcess

    private _items: ISearchResultItem[] = []

    public get onSearchStarted(): IEvent<void> {
        return this._onSearchStartedEvent
    }

    public get onSearchCompleted(): IEvent<ISearchResult> {
        return this._onSearchCompletedEvent
    }

    constructor(opts: ISearchOptions) {
        const args = getArgumentsFromSearchOptions(opts)

        this._finderProcess = new FinderProcess(RipGrep.getCommand() + " " + args.join(" "), "\n")

        this._finderProcess.onData.subscribe((items: string[]) => {
            const searchResultItems = items
                .map(ripGrepLineToSearchResultItem)
                .filter(item => item !== null)

            this._items = [...this._items, ...searchResultItems]
        })

        this._finderProcess.onComplete.subscribe(() => {
            this._onSearchCompletedEvent.dispatch({
                items: this._items,
                isComplete: true,
            })
        })
    }

    public start(): void {
        this._items = []
        this._finderProcess.start()
    }

    public cancel(): void {
        this._finderProcess.stop()
    }
}

import { EditorManager } from "./../Services/EditorManager"

export interface ISearchResultsViewer {
    showResults(results: ISearchResult): void
}

const itemsToQuickFixItems = (item: ISearchResultItem) => ({
    filename: item.fileName,
    lnum: item.line,
    col: item.column,
    text: item.text,
})

export class QuickFixSearchResultsViewer {
    constructor(private _editorManager: EditorManager) {}

    public showResult(results: ISearchResult): void {
        const quickFixEntries = results.items.map(itemsToQuickFixItems)

        const neovim: any = this._editorManager.activeEditor.neovim
        neovim.quickFix.setqflist(quickFixEntries, "Search Results")
        neovim.command(":copen")
    }
}
