/**
 * Learning.ts
 */

// import { Event, IEvent } from "oni-types"

import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { SidebarManager } from "./../Sidebar"

import { LearningPane } from "./LearningPane"

import { TutorialManager } from "./Tutorial/TutorialManager"

export const activate = (
    configuration: Configuration,
    editorManager: EditorManager,
    sidebarManager: SidebarManager,
) => {
    const learningEnabled =
        configuration.getValue("experimental.learning.enabled")

    if (!learningEnabled) {
        return
    }

    const tutorialManager = new TutorialManager(editorManager)

    sidebarManager.add("graduation-cap", new LearningPane(tutorialManager))
}
