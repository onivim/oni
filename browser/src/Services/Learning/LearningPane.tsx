/**
 * LearningPane.tsx
 *
 * UX for rendering the bookmarks experience in the sidebar
 */

import * as React from "react"

// import styled from "styled-components"

// import * as path from "path"

import { Event, IEvent, IDisposable } from "oni-types"

import { TutorialManager } from "./Tutorial/TutorialManager"

import { SidebarPane } from "./../Sidebar"
// import { IBookmark, IBookmarksProvider } from "./index"

// import { SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"
import { SidebarContainerView, SidebarItemView } from "./../../UI/components/SidebarItemView"
import { VimNavigator } from "./../../UI/components/VimNavigator"

export class LearningPane implements SidebarPane {
    private _onEnter = new Event<void>()
    private _onLeave = new Event<void>()

    constructor(private _tutorialManager: TutorialManager) {
        console.log(this._tutorialManager)
    }

    public get id(): string {
        return "oni.sidebar.learning"
    }

    public get title(): string {
        return "Learn"
    }

    public enter(): void {
        // this._tutorialManager.startTutorial(null)
        this._onEnter.dispatch()
    }

    public leave(): void {
        this._onLeave.dispatch()
    }

    public render(): JSX.Element {
        return <LearningPaneView onEnter={this._onEnter} onLeave={this._onLeave} />
    }
}

export interface ILearningPaneViewProps {
    onEnter: IEvent<void>
    onLeave: IEvent<void>
}

export interface ILearningPaneViewState {
    isActive: boolean
}

export class PureComponentWithDisposeTracking<TProps, TState> extends React.PureComponent<
    TProps,
    TState
> {
    private _subscriptions: IDisposable[] = []

    public componentDidMount(): void {
        this._cleanExistingSubscriptions()
    }

    public componentWillUnmount(): void {
        this._cleanExistingSubscriptions()
    }

    protected trackDisposable(disposable: IDisposable): void {
        this._subscriptions.push(disposable)
    }

    private _cleanExistingSubscriptions(): void {
        this._subscriptions.forEach(s => s.dispose())
        this._subscriptions = []
    }
}

export class LearningPaneView extends PureComponentWithDisposeTracking<
    ILearningPaneViewProps,
    ILearningPaneViewState
> {
    constructor(props: ILearningPaneViewProps) {
        super(props)

        this.state = {
            isActive: false,
        }
    }

    public componentDidMount(): void {
        super.componentDidMount()

        this.trackDisposable(this.props.onEnter.subscribe(() => this.setState({ isActive: true })))
        this.trackDisposable(this.props.onLeave.subscribe(() => this.setState({ isActive: false })))
    }

    public render(): JSX.Element {
        const ids = ["tutorial_container", "a", "b", "c"]

        return (
            <VimNavigator
                ids={ids}
                active={this.state.isActive}
                render={selectedId => {
                    const items = ["a", "b", "c"].map(item => (
                        <SidebarItemView
                            indentationLevel={1}
                            isFocused={selectedId === item}
                            text={item}
                        />
                    ))

                    return (
                        <SidebarContainerView
                            indentationLevel={0}
                            isFocused={selectedId === "tutorial_container"}
                            text={"Tutorials"}
                            isContainer={true}
                            isExpanded={true}
                        >
                            {items}
                        </SidebarContainerView>
                    )
                }}
            />
        )
    }
}
