/**
 * KeyDisplayer
 *
 * Utility for showing keys while typing
 */

import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"

import { IDisposable } from "oni-types"

import { parseChordParts } from "./../../Input/KeyParser"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"
import { InputManager } from "./../InputManager"
import { Overlay, OverlayManager } from "./../Overlay"

import { createStore, KeyDisplayerState } from "./KeyDisplayerStore"
import { KeyDisplayerContainer } from "./KeyDisplayerView"

export class KeyDisplayer {
    private _activeOverlay: Overlay = null
    private _currentResolveSubscription: IDisposable = null
    private _store: Store<KeyDisplayerState>

    constructor(
        private _configuration: Configuration,
        private _editorManager: EditorManager,
        private _inputManager: InputManager,
        private _overlayManager: OverlayManager,
    ) {
        this._store = createStore()
    }

    public get isActive(): boolean {
        return this._currentResolveSubscription !== null
    }

    public start(): void {
        this._currentResolveSubscription = this._inputManager.resolvers.addResolver(
            (evt, resolution) => {
                if (this._activeOverlay) {
                    this._activeOverlay.hide()
                    this._activeOverlay = null
                }

                if (
                    !this._configuration.getValue("keyDisplayer.showInInsertMode") &&
                    this._editorManager.activeEditor.mode === "insert"
                ) {
                    return resolution
                }

                this._store.dispatch({
                    type: "ADD_KEY",
                    key: parseChordParts(resolution).join("+"),
                    timeInMilliseconds: new Date().getTime(),
                })

                this._activeOverlay = this._overlayManager.createItem()
                this._activeOverlay.setContents(
                    <Provider store={this._store}>
                        <KeyDisplayerContainer />
                    </Provider>,
                )
                this._activeOverlay.show()
                return resolution
            },
        )
    }

    public end(): void {
        this._store.dispatch({ type: "RESET" })
        if (this._currentResolveSubscription) {
            this._currentResolveSubscription.dispose()
            this._currentResolveSubscription = null
        }
    }
}
