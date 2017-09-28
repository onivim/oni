import { Event, IEvent } from "./../../Event"
import * as Log from "./../../Log"

export interface IKeyMap {
    [key: string]: IKeyInfo
}

export interface IKeyInfo {
    unmodified: string
    withShift: string
    withAltGraphShift?: string
    withAltGraph?: string
}

class KeyboardLayoutManager {
    private _keyMap: IKeyMap = null
    private _onKeyMapChanged: Event<void> = new Event<void>()

    /**
     * Event that is triggered when the keymap is changed,
     * ie, when the keyboard layout is changed externally
     */
    public get onKeyMapChanged(): IEvent<void> {
        return this._onKeyMapChanged
    }

    public getCurrentKeyMap(): IKeyMap {
        if (!this._keyMap) {
            const KeyboardLayout = require("keyboard-layout") // tslint:disable-line no-var-requires
            Log.verbose("[Keyboard Layout] " + KeyboardLayout.getCurrentKeyboardLayout())
            this._keyMap = KeyboardLayout.getCurrentKeymap()

            // Lazily subscribe to the KeyboardLayout.onDidChangeCurrentKeyboardLayout
            // This is lazy primarily for unit testing outside of electron (where this module isn't available)
            KeyboardLayout.onDidChangeCurrentKeyboardLayout((newLayout: string) => {
                Log.verbose("[Keyboard Layout] " + newLayout)
                this._keyMap = KeyboardLayout.getCurrentKeymap()
                this._onKeyMapChanged.dispatch()
            })
        }

        return this._keyMap
    }
}

export const keyboardLayout = new KeyboardLayoutManager()
