/**
 * TutorialManager
 */

import * as Oni from "oni-api"

import { EditorManager } from "./../../EditorManager"

export interface ITutorial {
    public start(buffer: Oni.Buffer): Promise<void> {
        
    }
}

export interface ITutorialMetadata {
    category: string
    id: string

    name: string
}

export class TutorialManager {

    constructor(private _editorManager: EditorManager) {
        
    }

    public getTutorialInfo(): ITutorialMetadata[] {
        return []
    }

    public async startTutorial(id: string): Promise<void> {
        const tutorial = this._getTutorialById(id)
        await this._editorManager.activeEditor.openFile(tutorial.toString())
    }

    private _getTutorialById(id: string): ITutorialMetadata {
        return null
    }
}

