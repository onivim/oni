import { Plugin, Menu, Buffer } from "oni-api"
import { readdir, stat, pathExists } from "fs-extra"
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
        if (path.isAbsolute(bookmark)) {
            return bookmark
        }
        const userBaseDir = this._oni.configuration.getValue<string>("oni.bookmarks.baseDirectory")
        const baseDir = userBaseDir || homedir()
        return path.join(baseDir, bookmark)
    }

    public handleBookmark = async ({ metadata }: Menu.MenuOption) => {
        const bookmarkPath = this._getBookmarkPath(metadata.path)
        await this._handleItem(bookmarkPath)
    }

    // deliberately throw errors as a means of clarifying if a path exists
    // i.e. if isDir => true, else => false, if does not exist => new Error(err)
    public isDir = async (path: string) => {
        const stats = await stat(path)
        return stats.isDirectory()
    }

    private _handleItem = async (bookmarkPath: string) => {
        try {
            const isDirectory = await this.isDir(bookmarkPath)
            return isDirectory
                ? this._oni.workspace.changeDirectory(bookmarkPath)
                : this._oni.editors.openFile(bookmarkPath)
        } catch (error) {
            this._oni.log.warn(
                `[Oni Bookmarks Menu Error]: The Bookmark path ${bookmarkPath} does not exist: \n ${
                    error.message
                }`,
            )
        }
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
