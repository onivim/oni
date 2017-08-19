
import { commandManager } from "./CommandManager"

export type ActionFunction = () => boolean

export type ActionOrCommand = string | ActionFunction

export type FilterFunction = () => boolean

export interface KeyBinding {
    action: ActionOrCommand
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
    public bind(keyChord: string, action: ActionOrCommand, filterFunction: () => boolean) {
        // tslint:disable-line no-empty-block
    }

    public rebind(keyChord: string, action: ActionOrCommand, filterFunction: () => boolean) {
        this._boundKeys[keyChord] = [{ action, filter: filterFunction }]
    }

    public unbind(keyChord: string) {
        this._boundKeys[keyChord] = []
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

        for (let i = 0; i < boundKey.length; i++) { // tslint:disable-line prefer-for-of
            const binding = boundKey[i]

            // Does the binding pass filter?
            if (binding.filter && !binding.filter()) {
                return false
            }

            const action = binding.action
            if (typeof action === "string") {
                commandManager.executeCommand(action, null)
                return true
            } else {
                const result = action()

                if (result !== false) {
                    return true
                }
            }
        }

        return false
    }
}

export const inputManager = new InputManager()
