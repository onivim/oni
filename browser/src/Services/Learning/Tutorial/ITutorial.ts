/**
 * TutorialManager
 */

import * as Oni from "oni-api"

// import * as types from "vscode-languageserver-types"

import { ITutorialMetadata } from "./TutorialManager"

export interface ITutorialContext {
    buffer: Oni.Buffer
    editor: Oni.Editor
}

export interface ITutorialStage {
    goalName?: string
    tickFunction: (context: ITutorialContext) => Promise<boolean>
    render?: (renderContext: Oni.BufferLayerRenderContext) => JSX.Element
}

export interface ITutorial {
    metadata: ITutorialMetadata
    stages: ITutorialStage[]
}
