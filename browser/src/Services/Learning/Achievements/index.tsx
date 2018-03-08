/**
 * Achievements.ts
 *
 * Entry point for the 'achievements' feature
 */

import { Configuration } from "./../Configuratoin"
import { OverlayManager } from "./../../Overlay"

// import { AchievementNotificationRenderer } from "./AchievementNotificationRenderer"

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

    // const renderer = new AchievementNotificationRenderer(overlays)
}
