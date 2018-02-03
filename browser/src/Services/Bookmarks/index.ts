import { Event, IEvent } from "oni-types"

import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { SidebarManager } from "./../Sidebar"

import { BookmarksPane } from "./BookmarksPane"

import { INeovimMarks, INeovimMarkInfo } from "./../../neovim"

export interface IBookmark {
    group: string
    text: string
    id: string
}

export interface IBookmarksProvider {
    bookmarks: IBookmark[]
    onBookmarksUpdated: IEvent<void>
    selectBookmark(bookmark: IBookmark): void
}

const marksToBookmarks = (mark: INeovimMarkInfo): IBookmark => ({
    id: mark.mark,
    group: mark.global ? "Global Marks" : "Local Marks",
    text: `[${mark.mark}] ${mark.text}`,
})

export class NeovimBookmarksProvider implements IBookmarksProvider {
    private _lastBookmarks: IBookmark[] = []
    private _onBookmarksUpdated = new Event<void>()

    public get bookmarks(): IBookmark[] {
        return this._lastBookmarks
    }

    public get onBookmarksUpdated(): IEvent<void> {
        return this._onBookmarksUpdated
    }

    constructor(private _neovimMarks: INeovimMarks) {
        this._neovimMarks.onMarksUpdated.subscribe(marks => {
            this._lastBookmarks = marks.map(marksToBookmarks)

            this._onBookmarksUpdated.dispatch()
        })
    }

    public selectBookmark(bookmark: IBookmark): void {
        alert("Selecting bookmark: " + bookmark.id)
    }
}

let _bookmarks: IBookmarksProvider

export const activate = (
    configuration: Configuration,
    editorManager: EditorManager,
    sidebarManager: SidebarManager,
) => {
    // TODO: Push bookmarks provider to editor
    const neovim: any = editorManager.activeEditor.neovim
    neovim.marks.watchMarks()
    _bookmarks = new NeovimBookmarksProvider(neovim.marks)

    sidebarManager.add("bookmark", new BookmarksPane(_bookmarks))
}

export const getInstance = (): IBookmarksProvider => _bookmarks
