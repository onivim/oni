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

    public getCurrentKeyMap(): IKeyMap {
        if (!this._keyMap) {
            const KeyboardLayout = require("keyboard-layout") // tslint:disable-line no-var-requires
            this._keyMap = KeyboardLayout.getCurrentKeymap()
        }

        return this._keyMap
    }
}

export const keyboardLayout = new KeyboardLayoutManager()
