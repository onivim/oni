/**
 * LearningPane.tsx
 *
 * UX for rendering the bookmarks experience in the sidebar
 */

import * as React from "react"

import { Event, IEvent } from "oni-types"

import { CommandManager } from "./../CommandManager"

import { PureComponentWithDisposeTracking } from "./../../UI/components/PureComponentWithDisposeTracking"
import { SidebarButton } from "./../../UI/components/SidebarButton"
import { SidebarContainerView, SidebarItemView } from "./../../UI/components/SidebarItemView"
import { VimNavigator } from "./../../UI/components/VimNavigator"

import { Bold, Center, Container, Fixed, Full } from "./../../UI/components/common"
import { Icon, IconSize } from "./../../UI/Icon"
import { SidebarPane } from "./../Sidebar"

import { ITutorialMetadataWithProgress, TutorialManager } from "./Tutorial/TutorialManager"

import { noop } from "./../../Utility"

export class LearningPane implements SidebarPane {
    private _onEnter = new Event<void>()
    private _onLeave = new Event<void>()

    constructor(
        private _tutorialManager: TutorialManager,
        private _commandManager: CommandManager,
    ) {}

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
                onOpenAchievements={() => this._commandManager.executeCommand("achievements.show")}
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

import styled from "styled-components"

const TutorialItemViewIconContainer = styled.div`
    width: 2em;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.1);

    display: flex;
    justify-content: center;
    align-items: center;
`

const TutorialItemTitleWrapper = styled.div`
    font-size: 0.9em;
    margin-left: 0.5em;
`

const TutorialResultsWrapper = styled.div`
    font-size: 0.8em;
`

export const TutorialItemView = (props: { info: ITutorialMetadataWithProgress }): JSX.Element => {
    const isCompleted = !!props.info.completionInfo

    const icon = isCompleted ? <Icon name={"check"} /> : <Icon name={"circle-o"} />

    // TODO: Refactor this to a 'success' theme color, ie: highlight.success.background
    const backgroundColor = isCompleted ? "#5AB379" : "rgba(0, 0, 0, 0.1)"
    // TODO: Refactor this to a 'success' theme color, ie: highlight.success.foreground
    const color = isCompleted ? "white" : null

    const results = isCompleted ? (
        <div style={{ margin: "0.5em" }}>
            <TutorialResultsWrapper>
                <Bold>{(props.info.completionInfo.time / 1000).toFixed(2)}</Bold>s
            </TutorialResultsWrapper>
            <TutorialResultsWrapper>
                <Bold>{props.info.completionInfo.keyPresses}</Bold> keys
            </TutorialResultsWrapper>
        </div>
    ) : (
        <div style={{ margin: "0.5em" }}>--</div>
    )

    return (
        <Container direction="horizontal" fullWidth={true} style={{ backgroundColor, color }}>
            <Fixed style={{ backgroundColor }}>
                <TutorialItemViewIconContainer>{icon}</TutorialItemViewIconContainer>
            </Fixed>
            <Full style={{ margin: "0.5em", whiteSpace: "pre-wrap" }}>
                <TutorialItemTitleWrapper>{props.info.tutorialInfo.name}</TutorialItemTitleWrapper>
            </Full>
            <Fixed>
                <Center style={{ flexDirection: "column" }}>{results}</Center>
            </Fixed>
        </Container>
    )
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
        this.trackDisposable(
            this.props.tutorialManager.onTutorialProgressChangedEvent.subscribe(() => {
                this.setState({
                    tutorialInfo: this.props.tutorialManager.getTutorialInfo(),
                })
            }),
        )
    }

    public render(): JSX.Element {
        const tutorialIds = this.state.tutorialInfo.map(t => t.tutorialInfo.id)
        const ids = ["tutorial_container", ...tutorialIds, "trophy_case"]

        const tutorialItems = (selectedId: string) =>
            this.state.tutorialInfo.map(t => (
                <SidebarItemView
                    indentationLevel={0}
                    isFocused={selectedId === t.tutorialInfo.id}
                    text={<TutorialItemView info={t} />}
                    onClick={() => this._onSelect(t.tutorialInfo.id)}
                />
            ))

        const InnerTrophyButton: JSX.Element = (
            <Container
                direction="horizontal"
                style={{ justifyContent: "center", alignItems: "center" }}
            >
                <Fixed>
                    <Icon name="trophy" size={IconSize.Large} />
                </Fixed>
                <Full>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <div style={{ paddingLeft: "8px" }}>Achievements</div>
                    </div>
                </Full>
            </Container>
        )

        return (
            <VimNavigator
                ids={ids}
                active={this.state.isActive}
                onSelected={id => this._onSelect(id)}
                render={selectedId => {
                    const items = tutorialItems(selectedId)
                    return (
                        <Container
                            fullHeight={true}
                            fullWidth={true}
                            direction="vertical"
                            style={{
                                position: "absolute",
                                top: "0px",
                                left: "0px",
                                right: "0px",
                                bottom: "0px",
                            }}
                        >
                            <Full style={{ height: "100%" }}>
                                <SidebarContainerView
                                    indentationLevel={0}
                                    isFocused={selectedId === "tutorial_container"}
                                    text={"Tutorials"}
                                    isContainer={true}
                                    isExpanded={true}
                                    onClick={noop}
                                >
                                    {items}
                                </SidebarContainerView>
                            </Full>
                            <Fixed>
                                <div style={{ marginBottom: "2em", marginTop: "2em" }}>
                                    <SidebarButton
                                        text={InnerTrophyButton}
                                        focused={selectedId === "trophy_case"}
                                        onClick={() => this._onSelect("trophy_case")}
                                    />
                                </div>
                            </Fixed>
                        </Container>
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
