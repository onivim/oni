/**
 * TutorialManager
 */

import * as Oni from "oni-api"

import { Event, IEvent } from "oni-types"

import { ITutorial, ITutorialMetadata, ITutorialStage } from "./ITutorial"

export interface ITutorialState {
    metadata: ITutorialMetadata
    renderFunc?: (context: Oni.BufferLayerRenderContext) => JSX.Element
    activeGoalIndex: number
    goals: string[]
}

/**
 * Class that manages the state / lifecycle of the tutorial
 * - Calls the 'tick' function
 * - Calls the 'render' function
 */

export class TutorialGameplayManager {
    private _activeTutorial: ITutorial
    private _currentStageIdx: number
    private _onStateChanged = new Event<ITutorialState>()
    private _onCompleted = new Event<boolean>()
    private _currentState: ITutorialState = null

    private _isTickInProgress: boolean = false
    private _buf: Oni.Buffer

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

    constructor(private _editor: Oni.Editor) {}

    public start(tutorial: ITutorial, buffer: Oni.Buffer): void {
        this._buf = buffer
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

        this._tick()
    }

    private async _tick(): Promise<void> {
        if (this._isTickInProgress) {
            return
        }

        if (!this.currentStage) {
            return
        }

        this._isTickInProgress = true

        const result = await this.currentStage.tickFunction({
            editor: this._editor,
            buffer: this._buf,
        })

        this._isTickInProgress = false
        if (result) {
            this._currentStageIdx++

            if (this._currentStageIdx >= this._activeTutorial.stages.length) {
                this._onCompleted.dispatch(true)
                alert("done!")
            }
        }

        const goalsToSend = this._activeTutorial.stages.map(f => f.goalName)

        const newState: ITutorialState = {
            metadata: this._activeTutorial.metadata,
            goals: goalsToSend,
            activeGoalIndex: this._currentStageIdx,
            renderFunc: (context: Oni.BufferLayerRenderContext) =>
                this.currentStage.render ? this.currentStage.render(context) : null,
        }
        this._currentState = newState
        this._onStateChanged.dispatch(newState)
    }
}
