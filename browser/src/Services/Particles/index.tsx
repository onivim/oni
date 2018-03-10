/**
 * index.tsx
 *
 * Entry point for particle system
 */

import { OverlayManager, Overlay } from "./../Overlay"

export type Vector = { x: number; y: number }

export interface ParticleSystemDefinition {
    // StartSize: number
    // EndSize: number

    Position: Vector
    Velocity: Vector
    PositionVariance: Vector
    VelocityVariance: Vector
    Color: string

    StartOpacity: number
    EndOpacity: number

    Time: number
}

export interface Particle {
    position: Vector
    opacity: number
    color: string

    velocity: Vector
    opacityVelocity: number

    remainingTime: number
}

export class ParticleSystem {
    private _activeParticles: Particle[] = []
    private _activeOverlay: Overlay
    private _activeCanvas: HTMLCanvasElement

    private _lastTime: number

    constructor(private _overlayManager: OverlayManager) {}

    public createParticles(system: ParticleSystemDefinition): void {
        let newParticles: Particle[] = []

        for (let i = 0; i < 5; i++) {
            newParticles.push({
                position: {
                    x: system.Position.x + (Math.random() - 0.5) * system.PositionVariance.x,
                    y: system.Position.y + (Math.random() - 0.5) * system.PositionVariance.y,
                },
                color: "red",
                opacity: 1,
                velocity: {
                    x: system.Velocity.x + (Math.random() - 0.5) * system.VelocityVariance.x,
                    y: system.Velocity.y + (Math.random() - 0.5) * system.VelocityVariance.y,
                },
                opacityVelocity: -0.1,
                remainingTime: system.Time,
            })
        }

        this._activeParticles = [...this._activeParticles, ...newParticles]

        if (!this._activeOverlay) {
            this._activeOverlay = this._overlayManager.createItem()
            this._activeOverlay.setContents(
                <canvas
                    style={{ width: "100%", height: "100%" }}
                    ref={elem => (this._activeCanvas = elem)}
                />,
            )
            this._activeOverlay.show()
        }

        window.requestAnimationFrame(() => {
            this._update()
        })
    }

    private _start(): void {
        this._lastTime = new Date().getTime()
    }

    private _update(): void {
        const currentTime = new Date().getTime()
        const deltaTime = currentTime - this._lastTime
        this._lastTime = currentTime

        const updatedParticles = this._activeParticles.map(p => {
            return {
                ...p,
                position: {
                    x: p.position.x + p.velocity.x * deltaTime,
                    y: p.position.y + p.velocity.y * deltaTime,
                },
                remainingTime: p.remainingTime - deltaTime,
            }
        })

        const filteredParticles = updatedParticles.filter(p => p.remainingTime >= 0)

        this._activeParticles = filteredParticles

        if (this._activeParticles.length > 0) {
            this._draw()
            window.requestAnimationFrame(() => this._update())
        } else {
            // TODO: finish
        }
    }

    private _draw(): void {
        if (!this._activeCanvas) {
            return
        }

        const context = this._activeCanvas.getContext("2d")
        const width = this._activeCanvas.width
        const height = this._activeCanvas.height
        context.fillStyle = "red"
        context.clearRect(0, 0, width, height)

        this._activeParticles.forEach(p => {
            context.fillRect(p.position.x, p.position.y, 10, 10)
        })
    }
}

export const activate = (overlay: OverlayManager) => {
    const engine = new ParticleSystem(overlay)

    window.derp = () => {
        engine.createParticles({
            Position: { x: 100, y: 100 },
            PositionVariance: { x: 10, y: 10 },
            Velocity: { x: 1, y: 1 },
            VelocityVariance: { x: 0.1, y: 0.1 },
            Color: "yellow",
            StartOpacity: 1,
            EndOpacity: 0.5,
            Time: 1,
        })
    }
}
