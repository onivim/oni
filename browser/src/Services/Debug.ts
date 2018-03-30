/**
 * Debug.ts
 *
 * A set of commands used for debugging
 */

import { remote } from "electron"

import { CommandManager } from "./CommandManager"
import {
    AchievementsManager,
    getInstance as getAchievementsInstance,
} from "./Learning/Achievements"

export const activate = (commandManager: CommandManager) => {
    const openDevTools = () => {
        remote.getCurrentWindow().webContents.openDevTools()
        const achievements = getAchievementsInstance()
        achievements.notifyGoal("oni.goal.openDevTools")
    }

    commandManager.registerCommand({
        command: "oni.debug.openDevTools",
        name: "Debug: Open Developer Tools",
        detail: "Debug Oni and any running plugins, using the Chromium developer tools",
        execute: () => openDevTools(),
    })

    commandManager.registerCommand({
        command: "oni.debug.reload",
        name: "Debug: Reload Oni",
        detail: "Reloads the Oni instance. You will lose all unsaved changes!",
        execute: () => remote.getCurrentWindow().reload(),
    })
}

export const registerAchievements = (achievements: AchievementsManager) => {
    achievements.registerAchievement({
        uniqueId: "oni.achievement.openDevTools.1",
        name: "Pop the Hood",
        description: "Open the 'Developer Tools' for the first time",
        goals: [
            {
                name: null,
                goalId: "oni.goal.openDevTools",
                count: 1,
            },
        ],
    })

    achievements.registerAchievement({
        uniqueId: "oni.achievement.openDevTools.2",
        dependsOnId: "oni.achievement.openDevTools.1",
        name: "Mechanic",
        description: "Open the 'Developer Tools' ten times.",
        goals: [
            {
                name: null,
                goalId: "oni.goal.openDevTools",
                count: 10,
            },
        ],
    })
}
