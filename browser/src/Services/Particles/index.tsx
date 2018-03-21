/**
 * index.tsx
 *
 * Entry point for particle system
 */

import { CommandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { OverlayManager } from "./../Overlay"

import { ParticleSystem } from "./ParticleSystem"

export * from "./ParticleSystem"

let _engine: ParticleSystem = null

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
    overlay: OverlayManager,
) => {
    _engine = new ParticleSystem(overlay)

    if (configuration.getValue("experimental.particles.enabled")) {
        _engine.enabled = true

        commandManager.registerCommand({
            command: "debug.particles.test",
            name: null,
            detail: null,
            execute: () => {
                _engine.createParticles(25, {
                    Position: { x: 600, y: 500 },
                    PositionVariance: { x: 10, y: 10 },
                    Velocity: { x: 0, y: -350 },
                    VelocityVariance: { x: 200, y: 50 },
                    Color: "white",
                    StartOpacity: 1,
                    EndOpacity: 0,
                    Time: 1,
                })
            },
        })
    }
}

export const getInstance = (): ParticleSystem => {
    return _engine
}
