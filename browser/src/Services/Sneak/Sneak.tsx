/**
 * Sneak.tsx
 *
 * Provides the 'sneak layer' UI
 */

import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"

import { Event, IDisposable, IEvent } from "oni-types"

import { Overlay, OverlayManager } from "./../Overlay"

import {
    createStore as createSneakStore,
    IAugmentedSneakInfo,
    ISneakInfo,
    ISneakState,
} from "./SneakStore"
import { ConnectedSneakView } from "./SneakView"

export type SneakProvider = () => Promise<ISneakInfo[]>

export class Sneak {
    private _activeOverlay: Overlay
    private _providers: SneakProvider[] = []
    private _store: Store<ISneakState>
    private _onSneakCompleted = new Event<ISneakInfo>()

    public get onSneakCompleted(): IEvent<ISneakInfo> {
        return this._onSneakCompleted
    }

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

    // Get the first sneak with a 'tag' matching the passed in tag
    public getSneakMatchingTag(tag: string): IAugmentedSneakInfo | null {
        if (!this.isActive) {
            return null
        }

        const sneaks = this._store.getState().sneaks

        if (sneaks || sneaks.length === 0) {
            return null
        }

        return sneaks.find(s => s.tag && s.tag === tag)
    }

    public show(): void {
        if (this._activeOverlay) {
            this._activeOverlay.hide()
            this._activeOverlay = null
        }

        this._store.dispatch({
            type: "START",
            width: document.body.offsetWidth,
            height: document.body.offsetHeight,
        })
        this._collectSneakRectangles()

        this._activeOverlay = this._overlayManager.createItem()

        this._activeOverlay.setContents(
            <Provider store={this._store}>
                <ConnectedSneakView onComplete={info => this._onComplete(info)} />
            </Provider>,
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

        this._onSneakCompleted.dispatch(sneakInfo)
    }

    private _collectSneakRectangles(): void {
        this._providers.forEach(async provider => {
            const sneaks = await provider()
            const normalizedSneaks = sneaks.filter(s => !!s)
            this._store.dispatch({
                type: "ADD_SNEAKS",
                sneaks: normalizedSneaks,
            })
        })
    }
}
