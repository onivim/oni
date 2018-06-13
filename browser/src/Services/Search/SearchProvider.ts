import { Event, IEvent } from "oni-types"

import { configuration } from "./../Configuration"

import * as SearchApi from "./../../Plugins/Api/Search" // TODO: Import oni-api instead

import { FinderProcess } from "./FinderProcess"
import * as RipGrep from "./RipGrep"

class NullSearchQuery implements SearchApi.Query {
    public _onSearchResults = new Event<SearchApi.Result>()

    public start(): void {
        return undefined
    }

    public cancel(): void {
        return undefined
    }

    public get onSearchResults(): IEvent<SearchApi.Result> {
        return this._onSearchResults
    }
}

export class Search implements SearchApi.ISearch {
    public get nullSearch(): SearchApi.Query {
        return new NullSearchQuery()
    }

    public findInFile(opts: SearchApi.Options): SearchApi.Query {
        const commandParts = [
            RipGrep.getCommand(),
            ...RipGrep.getArguments(configuration.getValue("oni.exclude")),
            "-e",
            opts.searchQuery,
            ...(opts.fileFilter ? ["-g", opts.fileFilter] : []),
            "--",
            opts.workspace ? opts.workspace : ".",
        ]
        return new SearchQuery(commandParts.join(" "), parseRipGrepLine)
    }

    public findInPath(opts: SearchApi.Options): SearchApi.Query {
        const commandParts = [
            RipGrep.getCommand(),
            ...RipGrep.getArguments(configuration.getValue("oni.exclude")),
            "--files",
            "--",
            opts.workspace ? opts.workspace : ".",
        ]
        return new SearchQuery(commandParts.join(" "), parseRipGrepFilesLine)
    }
}

function parseRipGrepLine(ripGrepResult: string): SearchApi.ResultItem {
    if (!ripGrepResult || ripGrepResult.length === 0) {
        return null
    }

    const splitString = ripGrepResult.split(":")
    if (splitString.length < 4) {
        return null
    }

    const [fileName, line, column, ...result] = splitString
    const text = result.join(":")

    return {
        fileName,
        line: parseInt(line, 10),
        column: parseInt(column, 10),
        text,
    }
}

function parseRipGrepFilesLine(line: string): SearchApi.ResultItem {
    if (!line || line.length === 0) {
        return null
    }

    return {
        fileName: line,
        line: 0,
        column: 0,
        text: "",
    }
}

type IParseLine = (line: string) => SearchApi.ResultItem

class SearchQuery implements SearchApi.Query {
    private _onSearchResults = new Event<SearchApi.Result>()
    private _finderProcess: FinderProcess

    private _items: SearchApi.ResultItem[] = []

    public get onSearchResults(): IEvent<SearchApi.Result> {
        return this._onSearchResults
    }

    constructor(command: string, parseLine: IParseLine) {
        this._finderProcess = new FinderProcess(command, "\n")

        this._finderProcess.onData.subscribe((lines: string[]) => {
            const results = lines.map(parseLine).filter(item => item !== null)
            this._items = [...this._items, ...results]
            this._onSearchResults.dispatch({
                items: this._items,
                isComplete: false,
            })
        })

        this._finderProcess.onComplete.subscribe(() => {
            this._onSearchResults.dispatch({
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
