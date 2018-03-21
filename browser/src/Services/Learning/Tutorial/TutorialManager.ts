/**
 * TutorialManager
 */

import { EditorManager } from "./../../EditorManager"

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

export type IdToCompletionInfo = { [tutorialId: string]: ITutorialCompletionInfo }

export interface IPersistedTutorialState {
    completionInfo: IdToCompletionInfo
}

export class TutorialManager {
    private _tutorials: ITutorial[] = []

    private _persistedState: IPersistedTutorialState = { completionInfo: {} }

    constructor(
        private _editorManager: EditorManager,
        private _persistentStore: IPersistentStore<IPersistedTutorialState>,
    ) {}

    public async start(): Promise<void> {
        this._persistedState = await this._persistentStore.get()
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
        this._persistedState[id] = completionInfo
        await this._persistentStore.set(this._persistedState)
    }

    public getNextTutorialId(currentTutorialId?: string): string {
        const sortedTutorials = this._getSortedTutorials()

        if (!currentTutorialId) {
            return sortedTutorials[0].metadata.id
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
        layer.startTutorial(new Tutorials.BasicMovementTutorial())
        buf.addLayer(layer)
    }

    private _getSortedTutorials(): ITutorial[] {
        return this._tutorials
    }

    private _getCompletionState(id: string): ITutorialCompletionInfo {
        return this._persistedState[id] || null
    }
}
