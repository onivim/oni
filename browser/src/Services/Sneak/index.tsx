/**
 * Sneak/index.tsx
 *
 * Entry point for sneak functionality
 */

import { AchievementsManager } from "./../Learning/Achievements"
import { CallbackCommand, CommandManager } from "./../CommandManager"
import { OverlayManager } from "./../Overlay"

import { Sneak } from "./Sneak"

export * from "./SneakStore"

let _sneak: Sneak

export const activate = (commandManager: CommandManager, overlayManager: OverlayManager) => {
    _sneak = new Sneak(overlayManager)

    commandManager.registerCommand(
        new CallbackCommand(
            "sneak.show",
            "Sneak: Current Window",
            "Show commands for current window",
            () => {
                _sneak.show()
            },
        ),
    )

    commandManager.registerCommand(
        new CallbackCommand(
            "sneak.hide",
            "Sneak: Hide",
            "Hide sneak view",
            () => _sneak.close(),
            () => _sneak.isActive,
        ),
    )
}

export const registerAchievements = (achievements: AchievementsManager) => {
    achievements.registerAchievement({
        uniqueId: "oni.achievement.sneak.1",
        name: "Ninja!",
        description: "Use the 'sneak' functionality 5 times",
        goals: [
            {
                name: null,
                goalId: "oni.goal.sneak.complete",
                count: 5,
            },
        ],
    })

    achievements.registerAchievement({
        uniqueId: "oni.achievement.sneak.2",
        name: "REAL Ninja!",
        description: "Use the 'sneak' functionality 25 times",
        goals: [
            {
                name: null,
                goalId: "oni.goal.sneak.complete",
                count: 25,
            },
        ],
    })

    achievements.registerAchievement({
        uniqueId: "oni.achievement.sneak.3",
        name: "REAL ULTIMATE Ninja!",
        description: "Use the 'sneak' functionality 100 times",
        goals: [
            {
                name: null,
                goalId: "oni.goal.sneak.complete",
                count: 100,
            },
        ],
    })

    _sneak.onSneakCompleted.subscribe(val => {
        achievements.notifyGoal("oni.goal.sneak.complete")
    })
}

export const getInstance = (): Sneak => {
    return _sneak
}
