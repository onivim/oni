/**
 * Achievements.ts
 *
 * Entry point for the 'achievements' feature
 */

import { Configuration } from "./../../Configuration"
import { OverlayManager } from "./../../Overlay"

import { getPersistentStore, IPersistentStore } from "./../../../PersistentStore"

import { CommandManager } from "./../../CommandManager"
import { EditorManager } from "./../../EditorManager"

export * from "./AchievementsManager"

import { AchievementNotificationRenderer } from "./AchievementNotificationRenderer"
import { AchievementsBufferLayer } from "./AchievementsBufferLayer"
import { AchievementsManager, IPersistedAchievementState } from "./AchievementsManager"

let _achievements: AchievementsManager = null

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
    // sidebarManager: SidebarManager,
    overlays: OverlayManager,
) => {
    const achievementsEnabled = configuration.getValue("experimental.achievements.enabled")

    if (!achievementsEnabled) {
        return
    }

    const store: IPersistentStore<IPersistedAchievementState> = getPersistentStore(
        "oni-achievements",
        {
            goalCounts: {},
            achievedIds: [],
        },
    )

    const manager = new AchievementsManager(store)
    _achievements = manager

    const renderer = new AchievementNotificationRenderer(overlays)

    manager.onAchievementAccomplished.subscribe(achievement => {
        renderer.showAchievement({
            title: achievement.name,
            description: achievement.description,
        })
    })

    manager.registerAchievement({
        uniqueId: "oni.achievement.welcome",
        name: "Welcome to Oni!",
        description: "Launch Oni for the first time",
        goals: [
            {
                name: "Launch Oni",
                goalId: "oni.goal.launch",
                count: 1,
            },
        ],
    })

    manager.registerAchievement({
        uniqueId: "oni.achievement.dedication",
        name: "Dedication",
        description: "Launch Oni 25 times",
        goals: [
            {
                name: "Launch Oni",
                goalId: "oni.goal.launch",
                count: 25,
            },
        ],
    })

    manager.start().then(() => {
        manager.notifyGoal("oni.goal.launch")
    })

    const showAchievements = async () => {
        const buf = await editorManager.activeEditor.openFile("ACHIEVEMENTS.oni")
        buf.addLayer(new AchievementsBufferLayer(manager))
    }

    commandManager.registerCommand({
        command: "achievements.show",
        name: "Achievements: Open Trophy Case",
        detail: "Show accomplished and in-progress achievements",
        execute: () => showAchievements(),
    })
}

export const getInstance = (): AchievementsManager => {
    return _achievements
}
