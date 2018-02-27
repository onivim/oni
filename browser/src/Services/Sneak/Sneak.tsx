/**
 * Sneak.tsx
 *
 * Provides the 'sneak layer' UI
 */

import * as React from "react"
import { Store } from "redux"

import { IDisposable } from "oni-types"

import { Overlay, OverlayManager } from "./../Overlay"

import { createStore as createSneakStore, ISneakInfo, ISneakState } from "./SneakStore"
import { SneakView } from "./SneakView"

export type SneakProvider = () => ISneakInfo[]

export class Sneak {
    private _activeOverlay: Overlay
    private _providers: SneakProvider[] = []
    private _store: Store<ISneakState>

    constructor(private _overlayManager: OverlayManager) {
        this._store = createSneakStore()
    }

    public get isActive(): boolean {
        return !!this._activeOverlay
    }

    public addSneakProvider(provider: SneakProvider): IDisposable {
        this._providers.push(provider)
        const dispose = () => (this._providers = this._providers.filter(prov => prov !== provider))
        return { dispose }
    }

    public show(): void {
        this._store.dispatch({ type: "START" })

        const rects = this._collectSneakRectangles()

        this._store.dispatch({ type: "ADD_SNEAKS", sneaks: rects })

        if (this._activeOverlay) {
            this._activeOverlay.hide()
            this._activeOverlay = null
        }

        this._activeOverlay = this._overlayManager.createItem()

        this._activeOverlay.setContents(
            <SneakView
                sneaks={this._store.getState().sneaks}
                onComplete={info => this._onComplete(info)}
            />,
        )
        this._activeOverlay.show()
    }

    public close(): void {
        if (this._activeOverlay) {
            this._store.dispatch({ type: "END" })
            this._activeOverlay.hide()
            this._activeOverlay = null
        }
    }

    private _onComplete(sneakInfo: ISneakInfo): void {
        this.close()
        sneakInfo.callback()
    }

    private _collectSneakRectangles(): ISneakInfo[] {
        const ret = this._providers.reduce((prev: ISneakInfo[], cur: SneakProvider) => {
            const sneaks = cur().filter(s => !!s)
            return [...prev, ...sneaks]
        }, [])

        return ret
    }
}
