import { Event, IEvent } from "oni-types"

import { Configuration } from "./../Configuration"
import { SidebarManager } from "./../Sidebar"

import { BookmarksPane } from "./BookmarksPane"

export interface IBookmark {
    command: string
    arguments: any[]
    group: string
}

export class Bookmarks {
    private _bookmarks: IBookmark[] = []
    private _onBookmarksUpdatedEvent = new Event<void>()

    public get onBookmarksUpdated(): IEvent<void> {
        return this._onBookmarksUpdatedEvent
    }

    public getBookmarks(): IBookmark[] {
        return this._bookmarks
    }
}

// export interface IBookmarksProvider {
//     bookmarks: IBookmark[]
//     onBookmarksUpdated(): IEvent<void>
// }

// export class ConfigurationBookmarksProvider implements IBookmarksProvider {
//     private _bookmarks: IBookmark[] = []
//     private _onBookmarksUpdatedEvent = new Event<void>()

//     public get onBookmarksUpdated(): IEvent<void> {
//         return this._onBookmarksUpdatedEvent
//     }

//     constructor(
//         private _configuration: Configuration,
//     ) {
//         this._configuration.onConfigurationChanged.subscribe((newValues) => {

//         })
//     }
// }

// Providers:
// - Configuration bookmarks provider
// - Persisted bookmarks provider
// - Later: Browser bookmarks provider

// NEXT:
// - Extract out `SidebarExpander` component
//  - render
//  - getIds
// - Load 'oni.bookmarks' from configuration
//

let _bookmarks: Bookmarks

export const activate = (configuration: Configuration, sidebarManager: SidebarManager) => {
    _bookmarks = new Bookmarks()
    console.log("Bookmarks activated")

    sidebarManager.add("bookmark", new BookmarksPane())
}

export const getInstance = (): Bookmarks => _bookmarks
