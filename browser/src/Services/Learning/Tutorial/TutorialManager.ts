/**
 * TutorialManager
 */

import * as Oni from "oni-api"

import { EditorManager } from "./../../EditorManager"

import * as Tutorials from "./Tutorials"

export interface ITutorialState {
    renderFunc: (context: Oni.BufferLayerRenderContext) => JSX.Element
    activeGoalIndex: number
    goals: string[]
}

export interface ITutorialMetadata {
    id: string
    name: string
}

import { TutorialBufferLayer } from "./TutorialBufferLayer"

export class TutorialManager {
    constructor(private _editorManager: EditorManager) {}

    public getTutorialInfo(): ITutorialMetadata[] {
        return []
    }

    public async startTutorial(id: string): Promise<void> {
        // const tutorial = this._getTutorialById(id)
        const buf = await this._editorManager.activeEditor.openFile("Tutorial")
        const layer = new TutorialBufferLayer()
        layer.startTutorial(new Tutorials.BasicMovementTutorial())
        buf.addLayer(layer)
    }
}
