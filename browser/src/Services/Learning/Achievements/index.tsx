/**
 * Achievements.ts
 *
 * Entry point for the 'achievements' feature
 */

import { OverlayManager } from "./../../Overlay"

import { AchievementNotificationRenderer } from "./AchievementNotificationRenderer"

export * from "./AchievementsManager"

export const activate = (
    // configuration: Configuration,
    // editorManager: EditorManager,
    // sidebarManager: SidebarManager,
    overlays: OverlayManager,
) => {
    // const learningEnabled = configuration.getValue("experimental.learning.enabled")

    // if (!learningEnabled) {
    //     return
    // }

    const renderer = new AchievementNotificationRenderer(overlays)

    window["addAchievement"] = () => {
        renderer.showAchievement({
            title: "Not your daddy's vim",
            description: "Use all of the new functionality that Oni provides.",
        })
    }
}
