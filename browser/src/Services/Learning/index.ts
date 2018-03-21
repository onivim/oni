/**
 * Learning.ts
 */

import { getStore, IStore } from "./../../PersistentStore"

import { CommandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { OverlayManager } from "./../Overlay"
import { SidebarManager } from "./../Sidebar"

import { LearningPane } from "./LearningPane"
import { TutorialManager, IPersistedTutorialState } from "./Tutorial/TutorialManager"

import * as Achievements from "./Achievements"
import { ITutorial } from "./Tutorial/ITutorial"
import { AllTutorials } from "./Tutorial/Tutorials"

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
    overlayManager: OverlayManager,
    sidebarManager: SidebarManager,
) => {
    const learningEnabled = configuration.getValue("experimental.learning.enabled")

    Achievements.activate(commandManager, configuration, editorManager, overlayManager)

    if (!learningEnabled) {
        return
    }

    const store: IStore<IPersistedTutorialState> = getStore("oni-tutorial", {
        completionInfo: {},
    })
    const tutorialManager = new TutorialManager(editorManager, store)
    sidebarManager.add("trophy", new LearningPane(tutorialManager, commandManager))

    AllTutorials.forEach((tut: ITutorial) => tutorialManager.registerTutorial(tut))

    commandManager.registerCommand({
        command: "experimental.tutorial.start",
        name: null,
        detail: null,
        execute: () => tutorialManager.startTutorial(null),
    })
}
