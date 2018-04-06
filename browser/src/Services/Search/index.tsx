/**
 * Search/index.tsx
 *
 * Entry point for search-related features
 */

import * as React from "react"

import { Subject } from "rxjs/Subject"

import { Event, IEvent } from "oni-types"

import { CommandManager } from "./../CommandManager"
import { EditorManager } from "./../EditorManager"
import { SidebarManager } from "./../Sidebar"
import { Workspace } from "./../Workspace"

import * as Log from "./../../Log"

export * from "./SearchProvider"

import {
    ISearchOptions,
    ISearchProvider,
    ISearchQuery,
    QuickFixSearchResultsViewer,
    RipGrepSearchProvider,
} from "./SearchProvider"

import { SearchPaneView } from "./SearchPaneView"
import { SearchResultSpinnerView } from "./SearchResultsSpinnerView"

export class SearchPane {
    private _onEnter = new Event<void>()
    private _onLeave = new Event<void>()
    private _onSearchStarted = new Event<void>()
    private _onSearchCompleted = new Event<void>()
    private _shouldFocusAutomatically: boolean = false

    private _searchProvider: ISearchProvider
    private _currentQuery: ISearchQuery

    private _searchOptionsObservable = new Subject<ISearchOptions>()

    public get id(): string {
        return "oni.sidebar.search"
    }

    public get title(): string {
        return "Search"
    }

    constructor(
        private _editorManager: EditorManager,
        private _workspace: Workspace,
        private _onFocusEvent: IEvent<void>,
    ) {
        this._searchProvider = new RipGrepSearchProvider()

        this._searchOptionsObservable.auditTime(100).subscribe((opts: ISearchOptions) => {
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
        return (
            <div>
                <SearchPaneView
                    workspace={this._workspace}
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

    private _onSearchOptionsChanged(searchOpts: ISearchOptions): void {
        this._searchOptionsObservable.next(searchOpts)
    }

    private _startNewSearch(searchOpts: ISearchOptions): void {
        if (this._currentQuery) {
            this._currentQuery.cancel()
        }

        if (!searchOpts.searchQuery || searchOpts.searchQuery.length < 1) {
            return
        }

        Log.verbose("[SearchPane::_startNewSearch]: " + searchOpts.searchQuery)

        this._onSearchStarted.dispatch()

        const query = this._searchProvider.search(searchOpts)

        query.start()

        query.onSearchCompleted.subscribe(result => {
            this._onSearchCompleted.dispatch()
            const visualizer = new QuickFixSearchResultsViewer(this._editorManager)
            visualizer.showResult(result)
        })

        this._currentQuery = query
    }
}

export const activate = (
    commandManager: CommandManager,
    editorManager: EditorManager,
    sidebarManager: SidebarManager,
    workspace: Workspace,
) => {
    const onFocusEvent = new Event<void>()
    sidebarManager.add("search", new SearchPane(editorManager, workspace, onFocusEvent))

    const searchAllFiles = () => {
        sidebarManager.toggleVisibilityById("oni.sidebar.search")

        onFocusEvent.dispatch()
    }

    commandManager.registerCommand({
        command: "search.searchAllFiles",
        name: "Search: All files",
        detail: "Search across files in the active workspace",
        execute: searchAllFiles,
        enabled: () => !!workspace.activeWorkspace,
    })
}
