/**
 * Sneak/index.tsx
 *
 * Entry point for sneak functionality
 */

import { CallbackCommand, CommandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { AchievementsManager } from "./../Learning/Achievements"
import { OverlayManager } from "./../Overlay"
import { getInstance as getParticlesInstance } from "./../Particles"
import { Colors } from "./../Colors"

import { Sneak } from "./Sneak"

export * from "./SneakStore"

let _sneak: Sneak

export const activate = (
    colors: Colors,
    commandManager: CommandManager,
    configuration: Configuration,
    overlayManager: OverlayManager,
) => {
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

    initializeParticles(colors, configuration)
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

export const initializeParticles = (colors: Colors, configuration: Configuration) => {
    const isAnimationEnabled = () => configuration.getValue("ui.animations.enabled")
    const getVisualColor = () => colors.getColor("highlight.mode.visual.background")

    _sneak.onSneakCompleted.subscribe(sneak => {
        if (!isAnimationEnabled()) {
            return
        }
        const particles = getParticlesInstance()

        if (!particles) {
            return
        }

        particles.createParticles(15, {
            Position: { x: sneak.rectangle.x, y: sneak.rectangle.y },
            PositionVariance: { x: 0, y: 0 },
            Velocity: { x: 0, y: 0 },
            Gravity: { x: 0, y: 300 },
            VelocityVariance: { x: 200, y: 200 },
            Time: 0.2,
            Color: getVisualColor(),
        })
    })
}

export const getInstance = (): Sneak => {
    return _sneak
}
