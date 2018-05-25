/**
 * TutorialBufferLayer.tsx
 *
 * Layer that handles the top-level rendering of the tutorial UI,
 * including the nested `NeovimEditor`, description, goals, etc.
 */

import * as React from "react"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import styled from "styled-components"

import { NeovimEditor } from "./../../../Editor/NeovimEditor"

import { getInstance as getPluginManagerInstance } from "./../../../Plugins/PluginManager"
import { getInstance as getColorsInstance } from "./../../Colors"
import { getInstance as getCompletionProvidersInstance } from "./../../Completion"
import { configuration } from "./../../Configuration"
import { getInstance as getDiagnosticsInstance } from "./../../Diagnostics"
import { getInstance as getLanguageManagerInstance } from "./../../Language"
import { getInstance as getMenuManagerInstance } from "./../../Menu"
import { getInstance as getOverlayInstance } from "./../../Overlay"
import { getInstance as getSnippetManagerInstance } from "./../../Snippets"
import { getThemeManagerInstance } from "./../../Themes"
import { getInstance as getTokenColorsInstance } from "./../../TokenColors"
import { windowManager } from "./../../WindowManager"
import { getInstance as getWorkspaceInstance } from "./../../Workspace"

import { Bold, withProps } from "./../../../UI/components/common"
import { FlipCard } from "./../../../UI/components/FlipCard"
import { StatusBar } from "./../../../UI/components/StatusBar"

import { ITutorialState, TutorialGameplayManager } from "./TutorialGameplayManager"
import { TutorialManager } from "./TutorialManager"

import { CompletionView } from "./CompletionView"
import { GameplayBufferLayer } from "./GameplayBufferLayer"
import { GoalView } from "./GoalView"

import { getInstance, Vector } from "./../../Particles"

export interface IGameplayCompletionInfo {
    completed: boolean
    keyPresses: number
    timeInMilliseconds: number
}

const DefaultCompletionInfo = {
    completed: false,
    keyPresses: -1,
    timeInMilliseconds: 0,
}

export interface IGameplayStateChangedEvent {
    tutorialState: ITutorialState
    completionInfo: IGameplayCompletionInfo
    mode: string
}

export class GameTracker {
    private _startTime: Date
    private _keyPresses: number

    public start(): void {
        this._startTime = new Date()
        this._keyPresses = 0
    }

    public addKeyPress(pressCount: number) {
        this._keyPresses += pressCount
    }

    public end(): IGameplayCompletionInfo {
        return {
            completed: true,
            timeInMilliseconds: new Date().getTime() - this._startTime.getTime(),
            keyPresses: this._keyPresses,
        }
    }
}

export class TutorialBufferLayer implements Oni.BufferLayer {
    private _editor: NeovimEditor
    private _tutorialGameplayManager: TutorialGameplayManager
    private _initPromise: Promise<void>

    private _lastStage = -1
    private _hasAddedLayer: boolean = false
    private _currentTutorialId: string
    private _lastTutorialState: ITutorialState
    private _completionInfo: IGameplayCompletionInfo = DefaultCompletionInfo
    private _element: HTMLElement
    private _notes: JSX.Element[] = []
    private _gameTracker: GameTracker = new GameTracker()
    private _onStateChangedEvent: Event<ITutorialBufferLayerState> = new Event<
        ITutorialBufferLayerState
    >()

    public get id(): string {
        return "oni.layer.tutorial"
    }

    public get friendlyName(): string {
        return "Tutorial"
    }

    constructor(private _tutorialManager: TutorialManager) {
        // TODO: Streamline dependences for NeovimEditor, so it's easier just to spin one up..
        this._editor = new NeovimEditor(
            getColorsInstance(),
            getCompletionProvidersInstance(),
            configuration,
            getDiagnosticsInstance(),
            getLanguageManagerInstance(),
            getMenuManagerInstance(),
            getOverlayInstance(),
            getPluginManagerInstance(),
            getSnippetManagerInstance(),
            getThemeManagerInstance(),
            getTokenColorsInstance(),
            getWorkspaceInstance(),
        )

        this._editor.autoFocus = false

        this._editor.onNeovimQuit.subscribe(() => {
            // TODO:
            // Maybe add an achievement for 'quitting vim'?
            // Close current buffer / tab?
            alert("quit!")
        })

        this._initPromise = this._editor.init([], {
            loadInitVim: false,
        })

        this._tutorialGameplayManager = new TutorialGameplayManager(this._editor)

        this._tutorialGameplayManager.onStateChanged.subscribe(state => {
            this._lastTutorialState = state
            this._onStateChangedEvent.dispatch({
                tutorialState: state,
                completionInfo: this._completionInfo,
                mode: this._editor.mode,
                notes: this._notes,
            })

            if (state.activeGoalIndex !== this._lastStage) {
                this._lastStage = state.activeGoalIndex

                if (this._element) {
                    const cursor = this._element.getElementsByClassName("cursor")
                    if (cursor.length > 0) {
                        const cursorElement = cursor[0]
                        const position = cursorElement.getBoundingClientRect()

                        this._spawnParticles("white", { x: position.left, y: position.top })
                    }
                }
            }
        })

        this._tutorialGameplayManager.onCompleted.subscribe(() => {
            this._completionInfo = this._gameTracker.end()

            this._onStateChangedEvent.dispatch({
                tutorialState: this._lastTutorialState,
                completionInfo: this._completionInfo,
                mode: "normal",
                notes: this._notes,
            })

            this._tutorialManager.notifyTutorialCompleted(this._currentTutorialId, {
                time: this._completionInfo.timeInMilliseconds,
                keyPresses: this._completionInfo.keyPresses,
            })

            if (this._element) {
                const bounds = this._element.getBoundingClientRect()
                const blue = "rgb(97, 175, 239)"

                for (let i = 0; i < 8; i++) {
                    this._spawnParticles(
                        blue,
                        {
                            x: bounds.left + Math.random() * bounds.width,
                            y: bounds.top + Math.random() * bounds.height,
                        },
                        { x: 300, y: 150 },
                    )
                }
            }
        })
    }

    public handleInput(key: string): boolean {
        if (this._completionInfo.completed) {
            const nextTutorial = this._tutorialManager.getNextTutorialId(this._currentTutorialId)

            if (key === "<space>") {
                this.startTutorial(this._currentTutorialId)
            } else if (nextTutorial && key === "<enter>") {
                this.startTutorial(nextTutorial)
            } else {
                // No tutorial left - we'll pass through
                return false
            }
        } else {
            this._editor.input(key)
            this._gameTracker.addKeyPress(1)
        }
        return true
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return (
            <TutorialBufferLayerView
                editor={this._editor}
                renderContext={context}
                onStateChangedEvent={this._onStateChangedEvent}
                innerRef={elem => (this._element = elem)}
                onWillUnmount={() => this.stop()}
            />
        )
    }

    public async startTutorial(tutorialId: string): Promise<void> {
        await this._initPromise
        this._completionInfo = DefaultCompletionInfo
        this._currentTutorialId = tutorialId
        const tutorial = this._tutorialManager.getTutorial(tutorialId)

        if (!this._hasAddedLayer) {
            this._editor.activeBuffer.addLayer(
                new GameplayBufferLayer(this._tutorialGameplayManager),
            )
            this._hasAddedLayer = true
        }
        this._notes = tutorial.notes || []

        await this._editor.activeBuffer.setCursorPosition(0, 0)
        await this._editor.neovim.command("stopinsert")

        this._tutorialGameplayManager.start(tutorial, this._editor.activeBuffer)
        this._gameTracker.start()

        windowManager.focusSplit("oni.window.0")
    }

    public stop(): void {
        this._tutorialGameplayManager.stop()
    }

    private _spawnParticles(
        color: string,
        position: Vector,
        velocityVariance: Vector = { x: 100, y: 50 },
    ): void {
        const particles = getInstance()

        if (!particles || !this._element) {
            return
        }

        particles.createParticles(25, {
            Position: position,
            PositionVariance: { x: 10, y: 10 },
            Velocity: { x: 0, y: -150 },
            VelocityVariance: { x: 100, y: 50 },
            Color: color,
            StartOpacity: 1,
            EndOpacity: 0,
            Time: 1,
        })
    }
}

export interface ITutorialBufferLayerViewProps {
    renderContext: Oni.BufferLayerRenderContext
    editor: NeovimEditor
    onStateChangedEvent: IEvent<IGameplayStateChangedEvent>
    innerRef: (elem: HTMLElement) => void

    onWillUnmount: () => void
}

export interface ITutorialBufferLayerState {
    tutorialState: ITutorialState
    completionInfo: IGameplayCompletionInfo
    mode: string
    notes: JSX.Element[]
}

const TutorialWrapper = withProps<{}>(styled.div)`
    position: relative;
    width: 100%;
    height: 100%;
    background-color: ${p => p.theme["editor.background"]};
    color: ${p => p.theme["editor.foreground"]};
    overflow: auto;
    pointer-events: all;

    display: flex;
    flex-direction: row;
    `

const TutorialContentsWrapper = styled.div`
    flex: 1 1 auto;
    min-width: 600px;
    max-width: 1000px;

    margin-left: 2em;

    display: flex;
    flex-direction: column;
`

const TutorialNotesWrapper = styled.div`
    flex: 0 0 auto;
    width: 250px;
    border-left: 1px solid rgba(255, 255, 255, 0.2);
    margin: 3em 0em;

    display: flex;
    flex-direction: column;
`

const TutorialSectionWrapper = styled.div`
    width: 75%;
    max-width: 1000px;
    flex: 0 0 auto;
`

const MainTutorialSectionWrapper = styled.div`
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-height: 275px;

    display: flex;
    align-items: center;
`

const PrimaryHeader = styled.div`
    padding-top: 1em;
    font-size: 2em;
`

const SubHeader = styled.div`
    font-size: 1.6em;
`

const SectionHeader = styled.div`
    font-size: 1.1em;
    font-weight: bold;
`

const Section = styled.div`
    padding-top: 1em;
    padding-bottom: 2em;
`

const DescriptionWrapper = styled.div`
    display: none;

    @media (min-height: 800px) {
        display: block;
    }
`

export interface IModeStatusBarItemProps {
    mode: string
}

const ModeStatusBarItem = withProps<IModeStatusBarItemProps>(styled.div)`
    background-color: ${p => p.theme["highlight.mode." + p.mode + ".background"]};
    color: ${p => p.theme["highlight.mode." + p.mode + ".foreground"]};
    text-transform: uppercase;

    height: 2em;
    line-height: 2em;
    padding: 0px 4px;
`

export class TutorialBufferLayerView extends React.PureComponent<
    ITutorialBufferLayerViewProps,
    ITutorialBufferLayerState
> {
    constructor(props: ITutorialBufferLayerViewProps) {
        super(props)

        this.state = {
            tutorialState: {
                goals: [],
                activeGoalIndex: -1,
                metadata: null,
            },
            completionInfo: {
                completed: false,
                keyPresses: -1,
                timeInMilliseconds: -1,
            },
            mode: "normal",
            notes: [],
        }
    }

    public componentDidMount(): void {
        this.props.onStateChangedEvent.subscribe(newState => {
            this.setState({
                ...newState,
            })
        })
    }

    public componentWillUnmount(): void {
        this.props.onWillUnmount()
    }

    public render(): JSX.Element {
        if (!this.state.tutorialState || !this.state.tutorialState.metadata) {
            return null
        }

        const title = this.state.tutorialState.metadata.name
        const description = this.state.tutorialState.metadata.description

        const activeIndex = this.state.tutorialState.activeGoalIndex

        const goalsWithIndex = this.state.tutorialState.goals
            .map((goal, idx) => ({
                goalIndex: idx,
                goal,
            }))
            .filter(gi => !!gi.goal)

        let postActiveIndex = goalsWithIndex.findIndex(f => f.goalIndex === activeIndex)

        if (this.state.completionInfo.completed) {
            postActiveIndex = goalsWithIndex.length
        }

        const goalsToDisplay = goalsWithIndex.map((goal, postIndex) => {
            const isCompleted = postActiveIndex > postIndex

            let visible = false

            if (postActiveIndex === 0) {
                visible = postIndex < 3
            } else if (postActiveIndex > goalsWithIndex.length - 3) {
                visible = goalsWithIndex.length - postIndex <= 3
            } else {
                visible = Math.abs(postIndex - postActiveIndex) < 2
            }

            return (
                <GoalView
                    completed={isCompleted}
                    description={goal.goal}
                    active={goal.goalIndex === activeIndex}
                    visible={visible}
                />
            )
        })

        const isFlipped = this.state.completionInfo.completed

        return (
            <TutorialWrapper>
                <TutorialContentsWrapper>
                    <TutorialSectionWrapper>
                        <PrimaryHeader>Tutorial</PrimaryHeader>
                        <SubHeader>{title}</SubHeader>
                    </TutorialSectionWrapper>
                    <MainTutorialSectionWrapper>
                        <div
                            style={{
                                width: "75%",
                                height: "90%",
                                boxShadow: "3px 7px 10px 7px rgba(0, 0, 0, 0.2)",
                            }}
                            ref={this.props.innerRef}
                        >
                            <FlipCard
                                isFlipped={isFlipped}
                                front={
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                flex: "1 1 auto",
                                            }}
                                        >
                                            {this.props.editor.render()}
                                        </div>
                                        <div style={{ flex: "0 0 auto" }}>
                                            <StatusBar
                                                items={[
                                                    {
                                                        alignment: 0,
                                                        contents: <div />,
                                                        id: "tutorial.null",
                                                        priority: 0,
                                                    },
                                                    {
                                                        alignment: 1,
                                                        contents: (
                                                            <ModeStatusBarItem
                                                                mode={this.state.mode}
                                                            >
                                                                {this.state.mode}
                                                            </ModeStatusBarItem>
                                                        ),
                                                        id: "tutorial.mode",
                                                        priority: 0,
                                                    },
                                                ]}
                                                fontFamily={configuration.getValue("ui.fontFamily")}
                                                fontSize={configuration.getValue("ui.fontSize")}
                                                enabled={!isFlipped}
                                            />
                                        </div>
                                    </div>
                                }
                                back={
                                    isFlipped ? (
                                        <CompletionView
                                            keyStrokes={this.state.completionInfo.keyPresses}
                                            time={this.state.completionInfo.timeInMilliseconds}
                                        />
                                    ) : null
                                }
                            />
                        </div>
                    </MainTutorialSectionWrapper>
                    <TutorialSectionWrapper>
                        <DescriptionWrapper>
                            <SectionHeader>Description:</SectionHeader>
                            <Section>{description}</Section>
                        </DescriptionWrapper>
                        <SectionHeader>Goals:</SectionHeader>
                        <Section style={{ height: "200px" }}>
                            <div>{goalsToDisplay}</div>
                        </Section>
                        <Section />
                    </TutorialSectionWrapper>
                </TutorialContentsWrapper>
                <TutorialNotesWrapper>
                    <div style={{ textAlign: "center" }}>
                        <Bold>Notes:</Bold>
                    </div>
                    <div>{this.state.notes}</div>
                </TutorialNotesWrapper>
            </TutorialWrapper>
        )
    }
}
