import { IEvent } from "oni-types"

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
