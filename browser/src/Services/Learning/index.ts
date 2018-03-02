/**
 * Learning.ts
 */

// import { Event, IEvent } from "oni-types"

import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { SidebarManager } from "./../Sidebar"

import { LearningPane } from "./LearningPane"

export const activate = (
    configuration: Configuration,
    editorManager: EditorManager,
    sidebarManager: SidebarManager,
) => {
    const learningEnabled = configuration.getValue("experimental.learning.enabled")

    if (!learningEnabled) {
        return
    }

    sidebarManager.add("trophy", new LearningPane())
}
