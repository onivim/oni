/**
 * Learning.ts
 */

// import { Event, IEvent } from "oni-types"

import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { OverlayManager } from "./../Overlay"
import { SidebarManager } from "./../Sidebar"

import { LearningPane } from "./LearningPane"

import * as Achievements from "./Achievements"

export const activate = (
    configuration: Configuration,
    editorManager: EditorManager,
    overlayManager: OverlayManager,
    sidebarManager: SidebarManager,
) => {
    const learningEnabled = configuration.getValue("experimental.learning.enabled")

    if (!learningEnabled) {
        return
    }

    sidebarManager.add("trophy", new LearningPane())

    Achievements.activate(configuration, overlayManager)
}
