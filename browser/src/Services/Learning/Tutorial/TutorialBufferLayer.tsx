/**
 * TutorialBufferLayer.tsx
 *
 * Layer that handles the top-level rendering of the tutorial UI,
 * including the nested `NeovimEditor`, description, goals, etc.
 */

import * as React from "react"

import * as Oni from "oni-api"

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
import { getInstance as getWorkspaceInstance } from "./../../Workspace"

import { withProps } from "./../../../UI/components/common"
import { FlipCard } from "./../../../UI/components/FlipCard"

import { ITutorial } from "./ITutorial"
import { ITutorialState, TutorialGameplayManager } from "./TutorialGameplayManager"
import * as Tutorials from "./Tutorials"

import { CompletionView } from "./CompletionView"
import { GameplayBufferLayer } from "./GameplayBufferLayer"
import { GoalView } from "./GoalView"

import { getInstance, Vector } from "./../../Particles"

export class TutorialBufferLayer implements Oni.BufferLayer {
    private _editor: NeovimEditor
    private _tutorialGameplayManager: TutorialGameplayManager
    private _initPromise: Promise<void>

    private _element: HTMLElement

    private _isCompleted: boolean

    private _lastStage = -1

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

        this._editor.onNeovimQuit.subscribe(() => {
            alert("quit!")
        })

        this._initPromise = this._editor.init([]).then(() => {
            this._editor.enter()
        })

        this._tutorialGameplayManager = new TutorialGameplayManager(this._editor)

        this._tutorialGameplayManager.onStateChanged.subscribe(newState => {
            if (newState.activeGoalIndex !== this._lastStage) {
                this._lastStage = newState.activeGoalIndex

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
            this._isCompleted = true

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
            // this._spawnParticles(blue)
            // this._spawnParticles(blue)
            // this._spawnParticles(blue)
            alert("Completed!")
        })
    }

    public handleInput(key: string): boolean {
        if (this._isCompleted) {
            this._isCompleted = false
            this._tutorialGameplayManager.start(
                new Tutorials.SwitchModeTutorial(),
                this._editor.activeBuffer,
            )
        } else {
            this._editor.input(key)
        }
        return true
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return (
            <TutorialBufferLayerView
                editor={this._editor}
                renderContext={context}
                tutorialManager={this._tutorialGameplayManager}
                innerRef={elem => (this._element = elem)}
            />
        )
    }

    public async startTutorial(tutorial: ITutorial): Promise<void> {
        await this._initPromise
        this._tutorialGameplayManager.start(tutorial, this._editor.activeBuffer)
        this._editor.activeBuffer.addLayer(new GameplayBufferLayer(this._tutorialGameplayManager))
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
    tutorialManager: TutorialGameplayManager
    editor: NeovimEditor
    innerRef: (elem: HTMLElement) => void
}

export interface ITutorialBufferLayerState {
    tutorialState: ITutorialState
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
                completionInfo: { completed: false },
            },
        }
    }

    public componentDidMount(): void {
        this.props.tutorialManager.onStateChanged.subscribe(newState => {
            this.setState({ tutorialState: newState })
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
                            isFlipped={this.state.tutorialState.completionInfo.completed}
                            front={this.props.editor.render()}
                            back={<CompletionView keyStrokes={10} time={1.52} />}
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
