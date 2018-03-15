/**
 * AchievementsBufferLayer.tsx
 *
 * This is an implementation of a buffer layer to show the
 * achievements in a 'trophy-case' style view
 */

import * as React from "react"

// import styled, { keyframes } from "styled-components"

// import { inputManager, InputManager } from "./../../Services/InputManager"

import * as Oni from "oni-api"

import { AchievementsManager } from "./AchievementsManager"

export class AchievementsBufferLayer implements Oni.BufferLayer {
    public get id(): string {
        return "oni.layer.achievements"
    }

    public get friendlyName(): string {
        return "Achievements"
    }

    constructor(private _achievements: AchievementsManager) {}

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return <div>{JSON.stringify(this._achievements.getAchievements())}</div>
    }
}
