import { Plugin, Menu, Buffer } from "oni-api"
import { readdir, stat } from "fs-extra"
import { homedir } from "os"
import { Event, IEvent } from "oni-types"
import * as path from "path"

import { IAsyncSearch, QuickOpenResult } from "./QuickOpen"
import { QuickOpenItem, QuickOpenType } from "./QuickOpenItem"

export interface IBookmarkItem {
    fullPath: string
    type: string
}

export default class BookmarkSearch implements IAsyncSearch {
    private _onSearchResults = new Event<QuickOpenResult>()
    private _bookmarkItems: QuickOpenItem[]

    constructor(private _oni: Plugin.Api) {
        const bookmarks = this._oni.configuration.getValue<string[]>("oni.bookmarks", [])

        // TODO: Consider adding folders as well (recursive async with ignores/excludes)
        this._bookmarkItems = [
            new QuickOpenItem("Open Folder", "", QuickOpenType.folderHelp),
            ...bookmarks.map(
                folder => new QuickOpenItem(folder, "", QuickOpenType.bookmark, folder),
            ),
            new QuickOpenItem(
                "Open configuration",
                "For adding a bookmark",
                QuickOpenType.bookmarkHelp,
            ),
        ]
    }

    private _getBookmarkPath = (bookmark: string) => {
        const userBaseDir = this._oni.configuration.getValue<string>("oni.bookmarks.baseDirectory")
        const baseDir = userBaseDir || homedir()
        return path.join(baseDir, bookmark)
    }

    public handleBookmark = async ({ metadata }: Menu.MenuOption) => {
        const bookmarkPath = this._getBookmarkPath(metadata.path)
        await this._handleItem(bookmarkPath)
    }

    isDir = async (path: string) => {
        try {
            const stats = await stat(path)
            return stats.isDirectory()
        } catch (error) {
            console.warn(error)
            return false
        }
    }

    private _handleItem = (bookmarkPath: string) => {
        return this.isDir(bookmarkPath)
            ? this._oni.workspace.changeDirectory(bookmarkPath)
            : this._oni.editors.openFile(bookmarkPath)
    }

    public cancel(): void {}

    public changeQueryText(newText) {
        this._onSearchResults.dispatch({
            items: this._bookmarkItems,
            isComplete: true,
        })
    }

    public get onSearchResults(): IEvent<QuickOpenResult> {
        return this._onSearchResults
    }
}
