/**
 * Achievements.ts
 *
 * Entry point for the 'achievements' feature
 */

import { Configuration } from "./../../Configuration"
import { OverlayManager } from "./../../Overlay"

import { AchievementNotificationRenderer } from "./AchievementNotificationRenderer"

import { AchievementsManager, IPersistedAchievementState } from "./AchievementsManager"

import { getStore, IStore } from "./../../../Store"

export * from "./AchievementsManager"

export const activate = (
    configuration: Configuration,
    // editorManager: EditorManager,
    // sidebarManager: SidebarManager,
    overlays: OverlayManager,
) => {
    const achievementsEnabled = configuration.getValue("experimental.achievements.enabled")

    if (!achievementsEnabled) {
        return
    }

    const store: IStore<IPersistedAchievementState> = getStore("oni-achievements", {
        goalCounts: {},
        achievedIds: [],
    })

    const manager = new AchievementsManager(store)
    const renderer = new AchievementNotificationRenderer(overlays)

    manager.onAchievementAccomplished.subscribe(achievement => {
        renderer.showAchievement({
            title: achievement.name,
            description: achievement.description,
        })
    })
}
