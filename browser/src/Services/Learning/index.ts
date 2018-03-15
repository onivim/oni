/**
 * Learning.ts
 */

import { CommandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { OverlayManager } from "./../Overlay"
import { SidebarManager } from "./../Sidebar"

import { LearningPane } from "./LearningPane"
import { TutorialManager } from "./Tutorial/TutorialManager"

import * as Achievements from "./Achievements"

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
    overlayManager: OverlayManager,
    sidebarManager: SidebarManager,
) => {
    const learningEnabled = configuration.getValue("experimental.learning.enabled")

    if (!learningEnabled) {
        return
    }

    const tutorialManager = new TutorialManager(editorManager)
    sidebarManager.add("trophy", new LearningPane(tutorialManager))
    Achievements.activate(configuration, overlayManager)

    commandManager.registerCommand({
        command: "experimental.tutorial.start",
        name: null,
        detail: null,
        execute: () => tutorialManager.startTutorial(null),
    })
}
