/**
 * Overlay.ts
 *
 * API adapter for the Overlay store actions
 */

import * as Shell from "./../UI/Shell"

export class Overlay {
    private _contents: JSX.Element
    private _visible: boolean = false

    constructor(
        private _id: string,
    ) { }

    public show(): void {
        this._visible = true
        Shell.Actions.showOverlay(this._id, this._contents)
    }

    public hide(): void {
        this._visible = false
        Shell.Actions.hideOverlay(this._id)
    }

    public setContents(element: any): void {
        this._contents = element

        if (this._visible) {
            Shell.Actions.showOverlay(this._id, this._contents)
        }
    }
}

export class OverlayManager {
    private _id: number = 0

    constructor() {}

    public createItem(): Overlay {
        this._id++

        return new Overlay("overlay" + this._id.toString())
    }
}

let _overlays: OverlayManager = null
export const activate = (): void => {
    _overlays = new OverlayManager()
}

export const getInstance = (): OverlayManager => {
    return _overlays
}
