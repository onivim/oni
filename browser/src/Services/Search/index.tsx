import * as Oni from "oni-api"
import * as Log from "oni-core-logging"

import { Workspace } from "./../Workspace"

import * as React from "react"

import { Subject } from "rxjs/Subject"

import { Event, IEvent } from "oni-types"

import { SearchPaneView } from "./SearchPaneView"
import { SearchResultSpinnerView } from "./SearchResultsSpinnerView"

import { getInstance as getSidebarManager } from "../Sidebar" // TODO: Replace with oni-api usage

export class SearchPane {
    private _onEnter = new Event<void>()
    private _onLeave = new Event<void>()
    private _onSearchStarted = new Event<void>()
    private _onSearchCompleted = new Event<void>()
    private _shouldFocusAutomatically: boolean = false

    private _currentQuery: Oni.Search.Query

    private _searchOptionsObservable = new Subject<Oni.Search.Options>()

    public get id(): string {
        return "oni.sidebar.search"
    }

    public get title(): string {
        return "Search"
    }

    constructor(private _onFocusEvent: IEvent<void>, private _oni: Oni.Plugin.Api) {
        this._searchOptionsObservable.auditTime(100).subscribe((opts: Oni.Search.Options) => {
            this._startNewSearch(opts)
        })

        this._onFocusEvent.subscribe(() => {
            this._shouldFocusAutomatically = true
        })
    }

    public enter(): void {
        this._onEnter.dispatch()
    }

    public leave(): void {
        this._onLeave.dispatch()
    }

    public render(): JSX.Element {
        const immedateFocus = this._shouldFocusAutomatically
        this._shouldFocusAutomatically = false

        const typelessWorkspace: any = this._oni.workspace // TODO: Work-around this hack
        const workspace: Workspace = typelessWorkspace // TODO: Work-around this hack

        return (
            <div>
                <SearchPaneView
                    workspace={workspace}
                    onEnter={this._onEnter}
                    onLeave={this._onLeave}
                    onFocus={this._onFocusEvent}
                    onSearchOptionsChanged={opts => this._onSearchOptionsChanged(opts)}
                    focusImmediately={immedateFocus}
                />
                <SearchResultSpinnerView
                    onSearchStarted={this._onSearchStarted}
                    onSearchFinished={this._onSearchCompleted}
                />
            </div>
        )
    }

    private _onSearchOptionsChanged(searchOpts: Oni.Search.Options): void {
        this._searchOptionsObservable.next(searchOpts)
    }

    private _startNewSearch(searchOpts: Oni.Search.Options): void {
        if (this._currentQuery) {
            this._currentQuery.cancel()
        }

        if (!searchOpts.searchQuery || searchOpts.searchQuery.length < 1) {
            return
        }

        Log.verbose("[SearchPane::_startNewSearch]: " + searchOpts.searchQuery)

        this._onSearchStarted.dispatch()

        const query = this._oni.search.findInFile(searchOpts)

        query.start()

        query.onSearchResults.subscribe(result => {
            if (result.isComplete) {
                this._onSearchCompleted.dispatch()
            }
        })

        this._currentQuery = query
    }
}

export function activate(oni: any): any {
    const onFocusEvent = new Event<void>()

    const oniApi: Oni.Plugin.Api = oni

    // TODO: Add sidebar.add to the API and use oniApi instead of oni
    oni.sidebar.add("search", new SearchPane(onFocusEvent, oni))

    const sidebarManager = getSidebarManager() // TODO: Remove

    const searchAllFiles = () => {
        sidebarManager.toggleVisibilityById("oni.sidebar.search") // TODO: Use oni-api instead
        // TODO: Add sidebar.setActiveEntry to the API and use oni as Oni (API)
        // oni.sidebar.setActiveEntry("oni.sidebar.search")
        onFocusEvent.dispatch()
    }

    oniApi.commands.registerCommand({
        command: "search.searchAllFiles",
        name: "Search: All files",
        detail: "Search across files in the active workspace",
        execute: searchAllFiles,
        enabled: () => !!oniApi.workspace.activeWorkspace,
    })
}
