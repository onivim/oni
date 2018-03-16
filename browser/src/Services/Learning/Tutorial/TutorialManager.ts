/**
 * TutorialManager
 */

import { EditorManager } from "./../../EditorManager"

import { ITutorial, ITutorialMetadata } from "./ITutorial"
import * as Tutorials from "./Tutorials"

import { TutorialBufferLayer } from "./TutorialBufferLayer"

export interface ITutorialPersistedState {
    completedTutorialIds: string[]
}

export interface ITutorialMetadataWithProgress {
    tutorialInfo: ITutorialMetadata
    completed: boolean
}

export class TutorialManager {
    private _tutorials: ITutorial[] = []

    constructor(private _editorManager: EditorManager) {}

    public getTutorialInfo(): ITutorialMetadataWithProgress[] {
        return this._tutorials.map(tut => ({
            tutorialInfo: tut.metadata,
            completed: false,
        }))
    }

    public registerTutorial(tutorial: ITutorial): void {
        this._tutorials.push(tutorial)
    }

    public async startTutorial(id: string): Promise<void> {
        // const tutorial = this._getTutorialById(id)
        const buf = await this._editorManager.activeEditor.openFile("Tutorial")
        const layer = new TutorialBufferLayer()
        layer.startTutorial(new Tutorials.SwitchModeTutorial())
        buf.addLayer(layer)
    }
}
