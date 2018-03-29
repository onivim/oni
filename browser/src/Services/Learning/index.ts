/**
 * Learning.ts
 */

import { getPersistentStore, IPersistentStore } from "./../../PersistentStore"

import { CommandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { OverlayManager } from "./../Overlay"
import { SidebarManager } from "./../Sidebar"
import { WindowManager } from "./../WindowManager"

import { LearningPane } from "./LearningPane"
import { IPersistedTutorialState, TutorialManager } from "./Tutorial/TutorialManager"

import * as Achievements from "./Achievements"
import { ITutorial } from "./Tutorial/ITutorial"
import { AllTutorials } from "./Tutorial/Tutorials"

let _tutorialManager: TutorialManager

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
    overlayManager: OverlayManager,
    sidebarManager: SidebarManager,
    windowManager: WindowManager,
) => {
    const learningEnabled = configuration.getValue("experimental.learning.enabled")

    Achievements.activate(
        commandManager,
        configuration,
        editorManager,
        sidebarManager,
        overlayManager,
    )

    const achievements = Achievements.getInstance()

    if (!learningEnabled) {
        return
    }

    const store: IPersistentStore<IPersistedTutorialState> = getPersistentStore("oni-tutorial", {
        completionInfo: {},
    })
    _tutorialManager = new TutorialManager(editorManager, store, windowManager)
    _tutorialManager.start()
    sidebarManager.add("trophy", new LearningPane(_tutorialManager, commandManager))

    _tutorialManager.onTutorialCompletedEvent.subscribe(() => {
        achievements.notifyGoal("oni.achievement.tutorial.complete")
    })

    achievements.registerAchievement({
        uniqueId: "oni.achievement.padawan",
        name: "Padawan",
        description: "Complete a level in the interactive tutorial",
        goals: [
            {
                name: null,
                goalId: "oni.achievement.tutorial.complete",
                count: 1,
            },
        ],
    })

    AllTutorials.forEach((tut: ITutorial) => _tutorialManager.registerTutorial(tut))

    commandManager.registerCommand({
        command: "experimental.tutorial.start",
        name: null,
        detail: null,
        execute: () => _tutorialManager.startTutorial(null),
    })
}

export const getTutorialManagerInstance = () => _tutorialManager
