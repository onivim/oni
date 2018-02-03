/**
 * BookmarksPane.tsx
 *
 * UX for rendering the bookmarks experience in the sidebar
 */

import * as React from "react"

import { Event, IDisposable, IEvent } from "oni-types"

import { SidebarPane } from "./../Sidebar"
import { IBookmark, IBookmarksProvider } from "./index"

import { SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"
import { SidebarContainerView, SidebarItemView } from "./../../UI/components/SidebarItemView"
import { VimNavigator } from "./../../UI/components/VimNavigator"

export class BookmarksPane implements SidebarPane {
    private _onEnter = new Event<void>()
    private _onLeave = new Event<void>()

    constructor(private _bookmarksProvider: IBookmarksProvider) {}

    public get id(): string {
        return "oni.sidebar.bookmarks"
    }

    public get title(): string {
        return "Marks"
    }

    public enter(): void {
        this._onEnter.dispatch()
    }

    public leave(): void {
        this._onLeave.dispatch()
    }

    public render(): JSX.Element {
        return (
            <BookmarksPaneView
                bookmarksProvider={this._bookmarksProvider}
                onEnter={this._onEnter}
                onLeave={this._onLeave}
            />
        )
    }
}

export interface IBookmarksPaneViewProps {
    bookmarksProvider: IBookmarksProvider
    onEnter: IEvent<void>
    onLeave: IEvent<void>
}

export interface IBookmarksPaneViewState {
    bookmarks: IBookmark[]
    isActive: boolean

    isGlobalSectionExpanded: boolean
    isLocalSectionExpanded: boolean
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
            isActive: false,
            isGlobalSectionExpanded: true,
            isLocalSectionExpanded: true,
        }
    }

    public componentDidMount(): void {
        this._clearExistingSubscriptions()

        const s1 = this.props.bookmarksProvider.onBookmarksUpdated.subscribe(() => {
            this.setState({
                bookmarks: this.props.bookmarksProvider.bookmarks,
            })
        })

        const s2 = this.props.onEnter.subscribe(() => this.setState({ isActive: true }))
        const s3 = this.props.onLeave.subscribe(() => this.setState({ isActive: false }))

        this._subscriptions = [s1, s2, s3]
    }

    public componentWillUnmount(): void {
        this._clearExistingSubscriptions()
    }

    public render(): JSX.Element {
        if (this.state.bookmarks.length === 0) {
            return (
                <SidebarEmptyPaneView
                    active={this.state.isActive}
                    contentsText="No bookmarks, yet!"
                />
            )
        } else {
            const globalMarks = this.state.bookmarks.filter(bm => bm.group === "Global Marks")
            const localMarks = this.state.bookmarks.filter(bm => bm.group === "Local Marks")

            const globalMarkIds = this.state.isGlobalSectionExpanded
                ? globalMarks.map(bm => bm.id)
                : []
            const localMarkIds = this.state.isLocalSectionExpanded
                ? localMarks.map(bm => bm.id)
                : []

            const mapToItems = (selectedId: string) => (bm: IBookmark) => (
                <SidebarItemView
                    text={bm.text}
                    isFocused={selectedId === bm.id}
                    isContainer={false}
                    indentationLevel={0}
                />
            )

            const allIds = [
                "container.global",
                ...globalMarkIds,
                "container.local",
                ...localMarkIds,
            ]

            return (
                <VimNavigator
                    ids={allIds}
                    active={this.state.isActive}
                    onSelected={id => this._onSelected(id)}
                    render={selectedId => {
                        const mapFunc = mapToItems(selectedId)
                        return (
                            <div>
                                <SidebarContainerView
                                    text="Global Marks"
                                    isExpanded={this.state.isGlobalSectionExpanded}
                                    isFocused={selectedId === "container.global"}
                                >
                                    {globalMarks.map(mapFunc)}
                                </SidebarContainerView>
                                <SidebarContainerView
                                    text="Local Marks"
                                    isExpanded={this.state.isLocalSectionExpanded}
                                    isFocused={selectedId === "container.local"}
                                >
                                    {localMarks.map(mapFunc)}
                                </SidebarContainerView>
                            </div>
                        )
                    }}
                />
            )
        }
    }

    private _onSelected(id: string): void {
        if (id === "container.global") {
            this.setState({ isGlobalSectionExpanded: !this.state.isGlobalSectionExpanded })
        } else if (id === "container.local") {
            this.setState({ isLocalSectionExpanded: !this.state.isLocalSectionExpanded })
        }
    }

    private _clearExistingSubscriptions(): void {
        this._subscriptions.forEach(sub => sub.dispose())
        this._subscriptions = []
    }
}
