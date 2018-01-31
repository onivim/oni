/**
 * BookmarksPane.tsx
 *
 * UX for rendering the bookmarks experience in the sidebar
 */

import * as React from "react"

import { IDisposable } from "oni-types"

import { SidebarPane } from "./../Sidebar"
import { IBookmark, IBookmarksProvider } from "./index"

import { SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"

export class BookmarksPane implements SidebarPane {
    constructor(private _bookmarksProvider: IBookmarksProvider) {}

    public get id(): string {
        return "oni.sidebar.bookmarks"
    }

    public get title(): string {
        return "Bookmarks"
    }

    public enter(): void {}

    public leave(): void {}

    public render(): JSX.Element {
        return <BookmarksPaneView bookmarksProvider={this._bookmarksProvider} />
    }
}

export interface IBookmarksPaneViewProps {
    bookmarksProvider: IBookmarksProvider
}

export interface IBookmarksPaneViewState {
    bookmarks: IBookmark[]
}

export class BookmarksPaneView extends React.PureComponent<
    IBookmarksPaneViewProps,
    IBookmarksPaneViewState
> {
    private _subscriptions: IDisposable[] = []

    constructor(props: IBookmarksPaneViewProps) {
        super(props)
        this.state = {
            bookmarks: this.props.bookmarksProvider.bookmarks,
        }
    }

    public componentDidMount(): void {
        const s1 = this.props.bookmarksProvider.onBookmarksUpdated.subscribe(() => {
            this.setState({
                bookmarks: this.props.bookmarksProvider.bookmarks,
            })
        })

        this._subscriptions = [...this._subscriptions, s1]
    }

    public componentWillUnmount(): void {
        this._subscriptions.forEach(sub => sub.dispose())
        this._subscriptions = []
    }

    public render(): JSX.Element {
        if (this.state.bookmarks.length === 0) {
            return <SidebarEmptyPaneView contentsText="No bookmarks, yet!" />
        } else {
            const elems = this.state.bookmarks.map(bm => <div>{JSON.stringify(bm)}</div>)

            return <div>{elems}</div>
        }
    }
}
