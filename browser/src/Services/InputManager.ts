
export type ActionFunction = () => boolean

export type FilterFunction = () => boolean

export interface KeyBinding {
    action: ActionFunction
    filter?: FilterFunction
}

export interface KeyBindingMap {
    [key: string]: KeyBinding[]
}

export class InputManager implements Oni.InputManager {

    private _boundKeys: KeyBindingMap = {}

    /**
     * API Methods
     */
    public bind(keyChord: string, actionFunction: any, filterFunction: () => boolean) {

    }

    public rebind(keyChord: string, actionFunction: any, filterFunction: () => boolean) {
        this._boundKeys[keyChord] = [{ action: actionFunction, filter: filterFunction }]
    }

    public unbind(keyChord: string) {

    }

    public unbindAll() {
        this._boundKeys = {}
    }

    /**
     * Internal Methods
     */

    // Triggers an action handler if there is a bound-key that passes the filter.
    // Returns true if the key was handled and should not continue bubbling,
    // false otherwise.
    public handleKey(keyChord: string): boolean {
        if (!this._boundKeys[keyChord]) {
            return false
        }

        const boundKey = this._boundKeys[keyChord]

        for (let i = 0; i < boundKey.length; i++) {
            const binding = boundKey[i]

            // Does the binding pass filter?
            if (binding.filter && !binding.filter()) {
                return false
            }

            const action = binding.action()

            if (action !== false) {
                return true
            }
        }

        return false
    }
}

export const inputManager = new InputManager()
