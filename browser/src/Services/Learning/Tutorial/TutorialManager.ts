/**
 * TutorialManager
 */

import { Event, IEvent } from "oni-types"

import { EditorManager } from "./../../EditorManager"
import { WindowManager } from "./../../WindowManager"

import { IPersistentStore } from "./../../../PersistentStore"

import { ITutorial, ITutorialMetadata } from "./ITutorial"
import { TutorialBufferLayer } from "./TutorialBufferLayer"
import * as Tutorials from "./Tutorials"

export interface ITutorialPersistedState {
    completedTutorialIds: string[]
}

export interface ITutorialMetadataWithProgress {
    tutorialInfo: ITutorialMetadata
    completionInfo: ITutorialCompletionInfo
}

export interface ITutorialCompletionInfo {
    keyPresses: number
    time: number /* milliseconds */
}

export interface IdToCompletionInfo {
    [tutorialId: string]: ITutorialCompletionInfo
}

export interface IPersistedTutorialState {
    completionInfo: IdToCompletionInfo
}

export class TutorialManager {
    private _tutorials: ITutorial[] = []
    private _initPromise: Promise<IPersistedTutorialState>

    private _persistedState: IPersistedTutorialState = { completionInfo: {} }
    private _onTutorialCompletedEvent: Event<void> = new Event<void>()

    public get onTutorialCompletedEvent(): IEvent<void> {
        return this._onTutorialCompletedEvent
    }

    constructor(
        private _editorManager: EditorManager,
        private _persistentStore: IPersistentStore<IPersistedTutorialState>,
        private _windowManager: WindowManager,
    ) {}

    public async start(): Promise<IPersistedTutorialState> {
        if (this._initPromise) {
            return this._initPromise
        }

        this._initPromise = this._persistentStore.get()

        this._persistedState = await this._initPromise
        this._onTutorialCompletedEvent.dispatch()
        return this._persistedState
    }

    public getTutorialInfo(): ITutorialMetadataWithProgress[] {
        return this._getSortedTutorials().map(tut => ({
            tutorialInfo: tut.metadata,
            completionInfo: this._getCompletionState(tut.metadata.id),
        }))
    }

    public registerTutorial(tutorial: ITutorial): void {
        this._tutorials.push(tutorial)
    }

    public async notifyTutorialCompleted(
        id: string,
        completionInfo: ITutorialCompletionInfo,
    ): Promise<void> {
        await this.start()
        this._persistedState.completionInfo[id] = completionInfo
        await this._persistentStore.set(this._persistedState)
        this._onTutorialCompletedEvent.dispatch()
    }

    public getNextTutorialId(currentTutorialId?: string): string {
        const sortedTutorials = this._getSortedTutorials()

        if (!currentTutorialId) {
            // Get first tutorial not completed
            const nextIncompleteTutorial = sortedTutorials.find(f => {
                return !this._persistedState.completionInfo[f.metadata.id]
            })

            return nextIncompleteTutorial ? nextIncompleteTutorial.metadata.id : null
        }

        const currentTuturial = sortedTutorials.findIndex(
            tut => tut.metadata.id === currentTutorialId,
        )
        const nextTutorial = currentTuturial + 1

        if (nextTutorial >= sortedTutorials.length) {
            return null
        }

        return sortedTutorials[nextTutorial].metadata.id
    }

    public async startTutorial(id: string): Promise<void> {
        // const tutorial = this._getTutorialById(id)
        const buf = await this._editorManager.activeEditor.openFile("Tutorial")
        const layer = new TutorialBufferLayer()
        layer.startTutorial(new Tutorials.DeleteCharacterTutorial())
        buf.addLayer(layer)

        // Focus the editor
        const splitHandle = this._windowManager.getSplitHandle(this._editorManager
            .activeEditor as any)
        splitHandle.focus()
    }

    private _getSortedTutorials(): ITutorial[] {
        return this._tutorials.sort((a, b) => {
            return a.metadata.level - b.metadata.level
        })
    }

    private _getCompletionState(id: string): ITutorialCompletionInfo {
        return this._persistedState[id] || null
    }
}
