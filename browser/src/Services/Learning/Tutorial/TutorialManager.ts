/**
 * TutorialManager
 */

import * as Oni from "oni-api"

import { Event, IEvent } from "oni-types"
// import * as types from "vscode-languageserver-types"

import { EditorManager } from "./../../EditorManager"

export interface ITutorialContext {
    buffer: Oni.Buffer
}

export interface ITutorialStage {
    goalName?: string
    tickFunction: (context: ITutorialContext) => Promise<boolean>
    render: (renderContext: Oni.EditorLayerRenderContext) => JSX.Element
}

export interface ITutorial {
    metadata: ITutorialMetadata
    stages: ITutorialStage[]
}

export class BasicMovementTutorial implements ITutorial {
    private _idx: number = 0

    public get metadata(): ITutorialMetadata {
        return {
            category: "Basics",
            id: "basic_movement",
            name: "h, j, k, l movement",
        }
    }

    public get stages(): ITutorialStage[] {
        return [
            {
                goalName: "Init",
                tickFunction: async (context: ITutorialContext): Promise<boolean> => {
                    await context.buffer.setLines(0, 9, [
                        "....................",
                        "....................",
                        "....................",
                        "....................",
                        "....................",
                        "....................",
                        "....................",
                        "....................",
                        "....................",
                        "....................",
                    ])

                    return true
                },
                render: (context: Oni.EditorLayerRenderContext) => {
                    return null
                },
            },
            {
                goalName: "Testing",
                tickFunction: async (tutorialContext: ITutorialContext): Promise<boolean> => {
                    this._idx = this._idx || 0
                    this._idx++
                    console.log(this._idx)

                    return false
                },
                render: (context: Oni.EditorLayerRenderContext) => {
                    return null
                },
            },
        ]
    }
}

export interface ITutorialState {
    renderFunc: (context: Oni.EditorLayerRenderContext) => JSX.Element
    activeGoalIndex: number
    goals: string[]
}

/**
 * Class that manages the state / lifecycle of the tutorial
 * - Calls the 'tick' function
 * - Calls the 'render' function
 */

export class TutorialStateManager {
    private _activeTutorial: ITutorial
    private _currentStageIdx: number
    private _onStateChanged = new Event<ITutorialState>()
    private _onCompleted = new Event<boolean>()
    private _currentState: ITutorialState = null

    private _isTickInProgress: boolean = false

    public get onStateChanged(): IEvent<ITutorialState> {
        return this._onStateChanged
    }

    public get onCompleted(): IEvent<boolean> {
        return this._onCompleted
    }

    public get currentState(): ITutorialState {
        return this._currentState
    }

    public get currentStage(): ITutorialStage {
        return this._activeTutorial.stages[this._currentStageIdx]
    }

    public get currentTutorial(): ITutorial {
        return this._activeTutorial
    }

    constructor(private _editor: Oni.Editor, private _buf: Oni.Buffer) {}

    public start(tutorial: ITutorial): void {
        this._currentStageIdx = 0
        this._activeTutorial = tutorial

        this._editor.onModeChanged.subscribe((evt: string) => {
            this._tick()
        })

        this._editor.onBufferChanged.subscribe(() => {
            this._tick()
        })

        ;(this._editor as any).onCursorMoved.subscribe(() => {
            this._tick()
        })
    }

    private async _tick(): Promise<void> {
        if (this._isTickInProgress) {
            return
        }

        if (!this.currentStage) {
            return
        }

        this._isTickInProgress = true

        const result = await this.currentStage.tickFunction({ buffer: this._buf })

        this._isTickInProgress = false
        if (result) {
            this._currentStageIdx++

            if (this._currentStageIdx >= this._activeTutorial.stages.length) {
                this._onCompleted.dispatch(true)
                alert("done!")
            }
        }

        const newState: ITutorialState = {
            goals: [],
            activeGoalIndex: -1,
            renderFunc: (context: Oni.EditorLayerRenderContext) =>
                this.currentStage.render(context),
        }
        this._currentState = newState
        this._onStateChanged.dispatch(newState)
    }
}

export interface ITutorialMetadata {
    category: string
    id: string

    name: string
}

import { TutorialBufferLayer } from "./TutorialBufferLayer"

export class TutorialManager {
    constructor(private _editorManager: EditorManager) {
        window["derp"] = () => this.startTutorial(null)
    }

    public getTutorialInfo(): ITutorialMetadata[] {
        return []
    }

    public async startTutorial(id: string): Promise<void> {
        const tutorial = this._getTutorialById(id)
        console.log(tutorial)
        const buf = await this._editorManager.activeEditor.openFile("Tutorial")
        const tutorialStateManager = new TutorialStateManager(this._editorManager.activeEditor, buf)
        tutorialStateManager.start(new BasicMovementTutorial())
        buf.addLayer(new TutorialBufferLayer(buf, tutorialStateManager))
    }

    private _getTutorialById(id: string): ITutorialMetadata {
        return null
    }
}
