/**
 * LearningPane.tsx
 *
 * UX for rendering the bookmarks experience in the sidebar
 */

import * as React from "react"

import { Event, IEvent } from "oni-types"

import { PureComponentWithDisposeTracking } from "./../../UI/components/PureComponentWithDisposeTracking"
import { SidebarContainerView, SidebarItemView } from "./../../UI/components/SidebarItemView"
import { SidebarButton } from "./../../UI/components/SidebarButton"
import { VimNavigator } from "./../../UI/components/VimNavigator"

import { SidebarPane } from "./../Sidebar"

import { ITutorialMetadataWithProgress, TutorialManager } from "./Tutorial/TutorialManager"

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
        // this._tutorialManager.startTutorial(null)
        this._onEnter.dispatch()
    }

    public leave(): void {
        this._onLeave.dispatch()
    }

    public render(): JSX.Element {
        return (
            <LearningPaneView
                onEnter={this._onEnter}
                onLeave={this._onLeave}
                tutorialManager={this._tutorialManager}
                onStartTutorial={id => this._tutorialManager.startTutorial(id)}
                onOpenAchievements={() => alert("open achievements")}
            />
        )
    }
}

export interface ILearningPaneViewProps {
    onEnter: IEvent<void>
    onLeave: IEvent<void>
    tutorialManager: TutorialManager

    onStartTutorial: (tutorialId: string) => void
    onOpenAchievements: () => void
}

export interface ILearningPaneViewState {
    isActive: boolean
    tutorialInfo: ITutorialMetadataWithProgress[]
}

export const TutorialItemView = (props: { info: ITutorialMetadataWithProgress }): JSX.Element => {
    return <div>{props.info.tutorialInfo.name}</div>
}

export class LearningPaneView extends PureComponentWithDisposeTracking<
    ILearningPaneViewProps,
    ILearningPaneViewState
> {
    constructor(props: ILearningPaneViewProps) {
        super(props)

        this.state = {
            isActive: false,
            tutorialInfo: this.props.tutorialManager.getTutorialInfo(),
        }
    }

    public componentDidMount(): void {
        super.componentDidMount()

        this.trackDisposable(this.props.onEnter.subscribe(() => this.setState({ isActive: true })))
        this.trackDisposable(this.props.onLeave.subscribe(() => this.setState({ isActive: false })))
    }

    public render(): JSX.Element {
        const tutorialIds = this.state.tutorialInfo.map(t => t.tutorialInfo.id)
        const ids = ["tutorial_container", ...tutorialIds, "trophy_case"]

        const tutorialItems = (selectedId: string) =>
            this.state.tutorialInfo.map(t => (
                <SidebarItemView
                    indentationLevel={1}
                    isFocused={selectedId === t.tutorialInfo.id}
                    text={<TutorialItemView info={t} />}
                />
            ))

        return (
            <VimNavigator
                ids={ids}
                active={this.state.isActive}
                onSelected={id => this._onSelect(id)}
                render={selectedId => {
                    const items = tutorialItems(selectedId)
                    return (
                        <div>
                            <SidebarContainerView
                                indentationLevel={0}
                                isFocused={selectedId === "tutorial_container"}
                                text={"Tutorials"}
                                isContainer={true}
                                isExpanded={true}
                            >
                                {items}
                            </SidebarContainerView>
                            <SidebarButton
                                text={"Trophy Case"}
                                focused={selectedId === "trophy_case"}
                                onClick={() => this._onSelect("trophy_case")}
                            />
                        </div>
                    )
                }}
            />
        )
    }

    private _onSelect(selectedId: string) {
        if (selectedId === "tutorial_container") {
            // TODO: Handle expansion
        } else if (selectedId === "trophy_case") {
            this.props.onOpenAchievements()
        } else {
            this.props.onStartTutorial(selectedId)
        }
    }
}
