/**
 * LearningPane.tsx
 *
 * UX for rendering the bookmarks experience in the sidebar
 */

import * as React from "react"

// import styled from "styled-components"

// import * as path from "path"

import { Event } from "oni-types"

import { TutorialManager } from "./Tutorial/TutorialManager"

import { SidebarPane } from "./../Sidebar"
// import { IBookmark, IBookmarksProvider } from "./index"

// import { SidebarEmptyPaneView } from "./../../UI/components/SidebarEmptyPaneView"
// import { SidebarContainerView, SidebarItemView } from "./../../UI/components/SidebarItemView"
import { VimNavigator } from "./../../UI/components/VimNavigator"

export class LearningPane implements SidebarPane {
    private _onEnter = new Event<void>()
    private _onLeave = new Event<void>()

    constructor(private _tutorialManager: TutorialManager) {}

    public get id(): string {
        return "oni.sidebar.learning"
    }

    public get title(): string {
        return "Learn"
    }

    public enter(): void {
        this._onEnter.dispatch()
    }

    public leave(): void {
        this._onLeave.dispatch()
    }

    public render(): JSX.Element {
        return (
            <VimNavigator
                ids={[]}
                active={false}
                render={() => {
                    return <div>{JSON.stringify(this._tutorialManager.getTutorialInfo())}</div>
                }}
            />
        )
    }
}
