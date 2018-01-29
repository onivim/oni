/**
 * Search
 *
 * Service for workspace-wide search
 */

import { Event, IEvent } from "oni-types"

import * as RipGrep from "./QuickOpen/RipGrep"
import { FinderProcess } from "./QuickOpen/FinderProcess"

export interface ISearchResultItem {
    fileName: string
    lineNumber: number
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
        args.push(searchOpts.searchQuery)
    }

    return args
}

export class RipGrepSearchQuery {
    private _onSearchStartedEvent = new Event<void>()
    private _onSearchCompletedEvent = new Event<ISearchResult>()
    private _finderProcess: FinderProcess

    public get onSearchStarted(): IEvent<void> {
        return this._onSearchStartedEvent
    }

    public get onSearchCompleted(): IEvent<ISearchResult> {
        return this._onSearchCompletedEvent
    }

    constructor(opts: ISearchOptions) {
        const args = getArgumentsFromSearchOptions(opts)
        this._finderProcess = new FinderProcess(RipGrep.getCommand() + " " + args.join(" "))
    }

    public start(): void {
        this._finderProcess.start()
    }

    public cancel(): void {
        this._finderProcess.stop()
    }
}
