/**
 * ParticleSystem.tsx
 *
 * Lightweight, canvas-based particle system
 *
 * TODO:
 *  - Move this to a plugin, and access via the `getPlugin` API
 */

import * as React from "react"

import styled from "styled-components"

import { Overlay, OverlayManager } from "./../Overlay"

export interface Vector {
    x: number
    y: number
}

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

const StyledCanvas = styled.canvas`
    width: 100%;
    height: 100%;
`

/**
 * Lightweight canvas-based particle system renderer
 */
export class ParticleSystem {
    private _activeParticles: Particle[] = []
    private _activeOverlay: Overlay
    private _activeCanvas: HTMLCanvasElement

    private _lastTime: number
    private _enabled: boolean = false

    constructor(private _overlayManager: OverlayManager) {}

    public get enabled(): boolean {
        return this._enabled
    }
    public set enabled(val: boolean) {
        this._enabled = val
    }

    public createParticles(count: number, system: ParticleSystemDefinition): void {
        const newParticles: Particle[] = []

        for (let i = 0; i < count; i++) {
            newParticles.push({
                position: {
                    x: system.Position.x + (Math.random() - 0.5) * system.PositionVariance.x,
                    y: system.Position.y + (Math.random() - 0.5) * system.PositionVariance.y,
                },
                color: system.Color,
                opacity: system.StartOpacity,
                velocity: {
                    x: system.Velocity.x + (Math.random() - 0.5) * system.VelocityVariance.x,
                    y: system.Velocity.y + (Math.random() - 0.5) * system.VelocityVariance.y,
                },
                opacityVelocity: (system.EndOpacity - system.StartOpacity) / system.Time,
                remainingTime: system.Time,
            })
        }

        this._activeParticles = [...this._activeParticles, ...newParticles]

        if (!this._activeOverlay) {
            this._activeOverlay = this._overlayManager.createItem()
        }

        this._activeOverlay.show()
        this._activeOverlay.setContents(
            <StyledCanvas className="particles" innerRef={elem => (this._activeCanvas = elem)} />,
        )

        this._start()
    }

    private _start(): void {
        this._lastTime = new Date().getTime()
        window.requestAnimationFrame(() => {
            this._update()
        })
    }

    private _update(): void {
        const currentTime = new Date().getTime()
        const deltaTime = (currentTime - this._lastTime) / 1000
        this._lastTime = currentTime

        const updatedParticles = this._activeParticles.map(p => {
            return {
                ...p,
                position: {
                    x: p.position.x + p.velocity.x * deltaTime,
                    y: p.position.y + p.velocity.y * deltaTime,
                },
                velocity: {
                    x: p.velocity.x,
                    y: p.velocity.y + 500 * deltaTime,
                },
                opacity: p.opacity + p.opacityVelocity * deltaTime,
                remainingTime: p.remainingTime - deltaTime,
            }
        })

        const filteredParticles = updatedParticles.filter(p => p.remainingTime >= 0)

        this._activeParticles = filteredParticles

        this._draw()

        if (this._activeParticles.length > 0) {
            window.requestAnimationFrame(() => this._update())
        } else {
            if (this._activeOverlay) {
                this._activeOverlay.hide()
            }
        }
    }

    private _draw(): void {
        if (!this._activeCanvas) {
            return
        }

        const context = this._activeCanvas.getContext("2d", { alpha: true })
        const width = (this._activeCanvas.width = this._activeCanvas.offsetWidth)
        const height = (this._activeCanvas.height = this._activeCanvas.offsetHeight)
        context.clearRect(0, 0, width, height)

        this._activeParticles.forEach(p => {
            context.fillStyle = p.color
            context.globalAlpha = p.opacity
            context.fillRect(p.position.x, p.position.y, 2, 2)
        })
    }
}
