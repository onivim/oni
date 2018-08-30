import { Event, IEvent } from "oni-types"

import { configuration } from "./../Configuration"

import * as Oni from "oni-api"

import { FinderProcess } from "./FinderProcess"
import * as RipGrep from "./RipGrep"

class NullSearchQuery implements Oni.Search.Query {
    public _onSearchResults = new Event<Oni.Search.Result>()

    public start(): void {
        return undefined
    }

    public cancel(): void {
        return undefined
    }

    public get onSearchResults(): IEvent<Oni.Search.Result> {
        return this._onSearchResults
    }
}

export class Search implements Oni.Search.ISearch {
    public get nullSearch(): Oni.Search.Query {
        return new NullSearchQuery()
    }

    public findInFile(opts: Oni.Search.Options): Oni.Search.Query {
        const commandParts = [
            RipGrep.getCommand(),
            "--ignore-case",
            ...RipGrep.getArguments(
                configuration.getValue("oni.exclude"),
                configuration.getValue("editor.quickOpen.showHidden"),
            ),
            // "-e",
            ...(opts.fileFilter ? ["-g", opts.fileFilter] : []),
            "--",
            opts.searchQuery,
            opts.workspace ? opts.workspace : ".",
        ]
        return new SearchQuery(commandParts.join(" "), parseRipGrepLine)
    }

    public findInPath(opts: Oni.Search.Options): Oni.Search.Query {
        const commandParts = [
            RipGrep.getCommand(),
            ...RipGrep.getArguments(
                configuration.getValue("oni.exclude"),
                configuration.getValue("editor.quickOpen.showHidden"),
            ),
            "--files",
            "--",
            opts.workspace ? opts.workspace : ".",
        ]
        return new SearchQuery(commandParts.join(" "), parseRipGrepFilesLine)
    }
}

function parseRipGrepLine(ripGrepResult: string): Oni.Search.ResultItem {
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

function parseRipGrepFilesLine(line: string): Oni.Search.ResultItem {
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

type IParseLine = (line: string) => Oni.Search.ResultItem

class SearchQuery implements Oni.Search.Query {
    private _onSearchResults = new Event<Oni.Search.Result>()
    private _finderProcess: FinderProcess

    private _items: Oni.Search.ResultItem[] = []

    public get onSearchResults(): IEvent<Oni.Search.Result> {
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
