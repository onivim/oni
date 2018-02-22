import { Event, IEvent } from "oni-types"

import * as Log from "./../../Log"
import * as Platform from "./../../Platform"

export interface IKeyMap {
    [key: string]: IKeyInfo
}

export interface IKeyInfo {
    unmodified: string
    withShift: string
    withAltGraphShift?: string
    withAltGraph?: string
}

// Helper method to augment the key mapping in cases
// where it isn't accurate from `keyboard-layout`
const augmentKeyMap = (keyMap: IKeyMap, language: string): IKeyMap => {
    // Temporary hack to workaround atom/keyboard-layout#36
    if (Platform.isWindows() && language === "es-ES") {
        // tslint:disable-next-line no-string-literal
        keyMap["BracketLeft"] = {
            unmodified: null,
            withShift: null,
            withAltGraph: "[",
            withAltGraphShift: null,
        }
    }

    return keyMap
}

export class KeyboardLayoutManager {
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
            const keyboardLanguage = KeyboardLayout.getCurrentKeyboardLanguage()
            Log.verbose("[Keyboard Layout] " + KeyboardLayout.getCurrentKeyboardLayout())
            this._keyMap = augmentKeyMap(KeyboardLayout.getCurrentKeymap(), keyboardLanguage)

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
