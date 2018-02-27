/**
 * Sneak.tsx
 *
 * Provides the 'sneak layer' UI
 */

import * as React from "react"

import { Shapes } from "oni-api"
import { IDisposable } from "oni-types"

import { Overlay, OverlayManager } from "./../Overlay"

import { SneakView } from "./SneakView"

export interface ISneakInfo {
    rectangle: Shapes.Rectangle
    callback: () => void
}

export interface IAugmentedSneakInfo extends ISneakInfo {
    triggerKeys: string
}

export type SneakProvider = () => ISneakInfo[]

export class Sneak {
    private _activeOverlay: Overlay
    private _providers: SneakProvider[] = []

    constructor(private _overlayManager: OverlayManager) {}

    public get isActive(): boolean {
        return !!this._activeOverlay
    }

    public addSneakProvider(provider: SneakProvider): IDisposable {
        this._providers.push(provider)
        const dispose = () => (this._providers = this._providers.filter(prov => prov !== provider))
        return { dispose }
    }

    public show(): void {
        const rects = this._collectSneakRectangles()

        const augmentedRects = this._augmentSneakRectangles(rects)

        if (this._activeOverlay) {
            this._activeOverlay.hide()
            this._activeOverlay = null
        }

        this._activeOverlay = this._overlayManager.createItem()

        this._activeOverlay.setContents(
            <SneakView sneaks={augmentedRects} onComplete={info => this._onComplete(info)} />,
        )
        this._activeOverlay.show()
    }

    public close(): void {
        if (this._activeOverlay) {
            this._activeOverlay.hide()
            this._activeOverlay = null
        }
    }

    private _onComplete(sneakInfo: ISneakInfo): void {
        this.close()
        sneakInfo.callback()
    }

    private _augmentSneakRectangles(sneaks: ISneakInfo[]): IAugmentedSneakInfo[] {
        return sneaks.map((sneak, idx) => {
            return {
                ...sneak,
                triggerKeys: this._getLabelFromIndex(idx),
            }
        })
    }

    private _getLabelFromIndex(index: number): string {
        const firstDigit = Math.floor(index / 26)
        const secondDigit = index - firstDigit * 26
        return String.fromCharCode(97 + firstDigit, 97 + secondDigit).toUpperCase()
    }

    private _collectSneakRectangles(): ISneakInfo[] {
        const ret = this._providers.reduce((prev: ISneakInfo[], cur: SneakProvider) => {
            const sneaks = cur().filter(s => !!s)
            return [...prev, ...sneaks]
        }, [])

        return ret
    }
}
