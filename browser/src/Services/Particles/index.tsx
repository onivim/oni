/**
 * index.tsx
 *
 * Entry point for particle system
 */

import * as React from "react"

import * as Oni from "oni-api"
import * as types from "vscode-languageserver-types"

import { EditorManager } from "./../EditorManager"
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

import styled from "styled-components"

const StyledCanvas = styled.canvas`
    width: 100%;
    height: 100%;
`

export class ParticleSystem {
    private _activeParticles: Particle[] = []
    private _activeOverlay: Overlay
    private _activeCanvas: HTMLCanvasElement

    private _lastTime: number

    constructor(private _overlayManager: OverlayManager) {}

    public createParticles(count: number, system: ParticleSystemDefinition): void {
        let newParticles: Particle[] = []

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
            this._activeOverlay.setContents(
                <StyledCanvas
                    className="particles"
                    innerRef={elem => (this._activeCanvas = elem)}
                />,
            )
            this._activeOverlay.show()
        }

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
                    y: p.velocity.y + 250 * deltaTime,
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
            // TODO: finish
        }
    }

    private _draw(): void {
        if (!this._activeCanvas) {
            return
        }

        const context = this._activeCanvas.getContext("2d", { alpha: true })
        let width = (this._activeCanvas.width = this._activeCanvas.offsetWidth)
        let height = (this._activeCanvas.height = this._activeCanvas.offsetHeight)
        context.clearRect(0, 0, width, height)

        this._activeParticles.forEach(p => {
            context.fillStyle = p.color
            context.globalAlpha = p.opacity
            context.fillRect(p.position.x, p.position.y, 10, 10)
        })
    }
}

export const activate = (editorManager: EditorManager, overlay: OverlayManager) => {
    const engine = new ParticleSystem(overlay)

    window["derp"] = () => {
        engine.createParticles(25, {
            Position: { x: 600, y: 500 },
            PositionVariance: { x: 10, y: 10 },
            Velocity: { x: 0, y: -350 },
            VelocityVariance: { x: 200, y: 50 },
            Color: "yellow",
            StartOpacity: 1,
            EndOpacity: 0,
            Time: 1,
        })
    }

    window["derp2"] = () => {
        editorManager.activeEditor.activeBuffer.addLayer(
            new PowerModeBufferLayer(engine, editorManager.activeEditor),
        )
    }
}

export class PowerModeBufferLayer implements Oni.BufferLayer {
    public get id(): string {
        return "oni.layer.powermode"
    }

    public get friendlyName(): string {
        return "Power Mode"
    }

    private _latestRenderContext: Oni.BufferLayerRenderContext = null

    constructor(private _particles: ParticleSystem, private _editor: Oni.Editor) {
        this._editor.onCursorMoved.subscribe((cursor: Oni.Cursor) => {
            if (!this._latestRenderContext) {
                return
            }

            if (!this._latestRenderContext.isActive) {
                return
            }

            const screenPosition = this._latestRenderContext.bufferToScreen(
                types.Position.create(cursor.line, cursor.column),
            )
            const pixelPosition = this._latestRenderContext.screenToPixel(screenPosition)
            const elem = document.getElementById("oni.window.0")
            const editorPosition = elem.getBoundingClientRect()
            elem.style.transition = "all 0.1s linear"

            const randomX = (Math.random() - 0.5) * 10
            const randomY = (Math.random() - 0.5) * 10
            elem.style.transform = `translateX(${randomX}px) translateY(${randomY}px)`

            window.setTimeout(() => {
                elem.style.transform = "translateX(0px) translateY(0px)"
            }, 100)

            this._particles.createParticles(5, {
                Position: {
                    x: pixelPosition.pixelX + editorPosition.left,
                    y: pixelPosition.pixelY + editorPosition.top + 50,
                },
                PositionVariance: { x: 10, y: 10 },
                Velocity: { x: 0, y: -250 },
                VelocityVariance: { x: 200, y: 50 },
                Color: "yellow",
                StartOpacity: 1,
                EndOpacity: 0,
                Time: 1,
            })
        })
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        this._latestRenderContext = context

        return null
    }
}
