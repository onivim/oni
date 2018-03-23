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

import { withProps } from "./../../../UI/components/common"
import { FlipCard } from "./../../../UI/components/FlipCard"
import { StatusBar } from "./../../../UI/components/StatusBar"

import { ITutorial } from "./ITutorial"
import { ITutorialState, TutorialGameplayManager } from "./TutorialGameplayManager"
import * as Tutorials from "./Tutorials"

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
    private _lastTutorialState: ITutorialState
    private _completionInfo: IGameplayCompletionInfo = DefaultCompletionInfo
    private _element: HTMLElement
    private _gameTracker: GameTracker = new GameTracker()
    private _onStateChangedEvent: Event<IGameplayStateChangedEvent> = new Event<
        IGameplayStateChangedEvent
    >()

    public get id(): string {
        return "oni.tutorial"
    }

    public get friendlyName(): string {
        return "Tutorial"
    }

    constructor() {
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
            alert("quit!")
        })

        this._initPromise = this._editor.init([])

        this._tutorialGameplayManager = new TutorialGameplayManager(this._editor)

        this._tutorialGameplayManager.onStateChanged.subscribe(state => {
            this._lastTutorialState = state
            this._onStateChangedEvent.dispatch({
                tutorialState: state,
                completionInfo: this._completionInfo,
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
            this.startTutorial(new Tutorials.SwitchModeTutorial())
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
            />
        )
    }

    public async startTutorial(tutorial: ITutorial): Promise<void> {
        await this._initPromise
        this._completionInfo = DefaultCompletionInfo
        this._tutorialGameplayManager.start(tutorial, this._editor.activeBuffer)
        this._editor.activeBuffer.addLayer(new GameplayBufferLayer(this._tutorialGameplayManager))
        this._gameTracker.start()

        windowManager.focusSplit("oni.window.0")
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
}

export interface ITutorialBufferLayerState {
    tutorialState: ITutorialState
    completionInfo: IGameplayCompletionInfo
}

const TutorialWrapper = withProps<{}>(styled.div)`
    position: relative;
    width: 100%;
    height: 100%;
    background-color: ${p => p.theme["editor.background"]};
    color: ${p => p.theme["editor.foreground"]};

    max-width: 1000px;

    display: flex;
    flex-direction: column;
    padding-left: 1em;
    `

const TutorialSectionWrapper = styled.div`
    width: 80%;
    max-width: 1000px;
    flex: 0 0 auto;
`

const MainTutorialSectionWrapper = styled.div`
    flex: 1 1 auto;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
`

const PrimaryHeader = styled.div`
    padding-top: 2em;
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
        }
    }

    public componentDidMount(): void {
        this.props.onStateChangedEvent.subscribe(newState => {
            this.setState({
                ...newState,
            })
        })
    }

    public render(): JSX.Element {
        if (!this.state.tutorialState || !this.state.tutorialState.metadata) {
            return null
        }

        const title = this.state.tutorialState.metadata.name
        const description = this.state.tutorialState.metadata.description

        const activeIndex = this.state.tutorialState.activeGoalIndex
        const goals = this.state.tutorialState.goals.map((goal, idx) => {
            const isCompleted = idx < activeIndex
            const visible = Math.abs(idx - activeIndex) < 2
            return (
                <GoalView
                    completed={isCompleted}
                    description={goal}
                    active={idx === activeIndex}
                    visible={visible}
                />
            )
        })

        return (
            <TutorialWrapper>
                <TutorialSectionWrapper>
                    <PrimaryHeader>Tutorial</PrimaryHeader>
                    <SubHeader>{title}</SubHeader>
                </TutorialSectionWrapper>
                <MainTutorialSectionWrapper>
                    <div
                        style={{
                            width: "75%",
                            height: "75%",
                            boxShadow: "3px 7px 10px 7px rgba(0, 0, 0, 0.2)",
                        }}
                        ref={this.props.innerRef}
                    >
                        <FlipCard
                            isFlipped={this.state.completionInfo.completed}
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
                                        style={{ width: "100%", height: "100%", flex: "1 1 auto" }}
                                    >
                                        {this.props.editor.render()}
                                    </div>
                                    <div style={{ flex: "0 0 auto" }}>
                                        <StatusBar
                                            items={[]}
                                            fontFamily="Arial"
                                            fontSize="12px"
                                            enabled={true}
                                        />
                                    </div>
                                </div>
                            }
                            back={
                                <CompletionView
                                    keyStrokes={this.state.completionInfo.keyPresses}
                                    time={this.state.completionInfo.timeInMilliseconds}
                                />
                            }
                        />
                    </div>
                </MainTutorialSectionWrapper>
                <TutorialSectionWrapper>
                    <SectionHeader>Description:</SectionHeader>
                    <Section>{description}</Section>
                    <SectionHeader>Goals:</SectionHeader>
                    <Section>
                        <div>{goals}</div>
                    </Section>
                    <Section />
                </TutorialSectionWrapper>
            </TutorialWrapper>
        )
    }
}
