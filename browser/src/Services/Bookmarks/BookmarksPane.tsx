/**
 * BookmarksPane.tsx
 *
 * UX for rendering the bookmarks experience in the sidebar
 */

import * as React from "react"

import { SidebarPane } from "./../Sidebar"

export class BookmarksPane implements SidebarPane {
    public get id(): string {
        return "oni.sidebar.bookmarks"
    }

    public get title(): string {
        return "Bookmarks"
    }

    public enter(): void {
        console.log("entering pane")
    }

    public leave(): void {
        console.log("leaving pane")
    }

    public render(): JSX.Element {
        return <BookmarksPaneView />
    }
}

export class BookmarksPaneView extends React.PureComponent<{}, {}> {
    public render(): JSX.Element {
        return <div>"hello"</div>
    }
}
