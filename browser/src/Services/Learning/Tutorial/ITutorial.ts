/**
 * TutorialManager
 */

import * as Oni from "oni-api"

// import * as types from "vscode-languageserver-types"

export interface ITutorialContext {
    buffer: Oni.Buffer
    editor: Oni.Editor
}

export interface ITutorialStage {
    goalName?: string
    tickFunction: (context: ITutorialContext) => Promise<boolean>
    render?: (renderContext: Oni.BufferLayerRenderContext) => JSX.Element
}

export interface ITutorialMetadata {
    id: string
    name: string
    level: number
}

export interface ITutorial {
    metadata: ITutorialMetadata
    stages: ITutorialStage[]
}
