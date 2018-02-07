import * as Oni from "oni-api"

import { commandManager } from "./CommandManager"

export type ActionFunction = () => boolean

export type ActionOrCommand = string | ActionFunction

export type FilterFunction = () => boolean

import { IKeyChord, parseKeysFromVimString } from "./../Input/KeyParser"

export interface KeyBinding {
    action: ActionOrCommand
    filter?: FilterFunction
}

export interface KeyBindingMap {
    [key: string]: KeyBinding[]
}

import { KeyboardResolver } from "./../Input/Keyboard/KeyboardResolver"

import {
    getMetaKeyResolver,
    ignoreMetaKeyResolver,
    remapResolver,
} from "./../Input/Keyboard/Resolvers"

export class InputManager implements Oni.InputManager {
    private _boundKeys: KeyBindingMap = {}
    private _resolver: KeyboardResolver

    constructor() {
        this._resolver = new KeyboardResolver()

        this._resolver.addResolver(ignoreMetaKeyResolver)
        this._resolver.addResolver(remapResolver)
        this._resolver.addResolver(getMetaKeyResolver())
    }

    /**
     * API Methods
     */
    public bind(
        keyChord: string | string[],
        action: ActionOrCommand,
        filterFunction?: () => boolean,
    ): Oni.DisposeFunction {
        if (Array.isArray(keyChord)) {
            const disposalFunctions = keyChord.map(key => this.bind(key, action, filterFunction))
            return () => disposalFunctions.forEach(df => df())
        }

        const normalizedKeyChord = keyChord.toLowerCase()
        const currentBinding = this._boundKeys[normalizedKeyChord] || []
        const newBinding = { action, filter: filterFunction }

        this._boundKeys[normalizedKeyChord] = [...currentBinding, newBinding]

        return () => {
            const existingBindings = this._boundKeys[normalizedKeyChord]

            if (existingBindings) {
                this._boundKeys[normalizedKeyChord] = existingBindings.filter(f => f !== newBinding)
            }
        }
    }

    public unbind(keyChord: string | string[]) {
        if (Array.isArray(keyChord)) {
            keyChord.forEach(key => this.unbind(keyChord))
            return
        }

        const normalizedKeyChord = keyChord.toLowerCase()
        this._boundKeys[normalizedKeyChord] = []
    }

    public unbindAll() {
        this._boundKeys = {}
    }

    /**
     * Potential API methods
     */
    public hasBinding(keyChord: string): boolean {
        return !!this._boundKeys[keyChord]
    }

    public get resolvers(): KeyboardResolver {
        return this._resolver
    }

    // Returns an array of keys bound to a command
    public getBoundKeys(command: string): string[] {
        return Object.keys(this._boundKeys).reduce(
            (prev: string[], currentValue: string) => {
                const bindings = this._boundKeys[currentValue]
                if (bindings.find(b => b.action === command)) {
                    return [...prev, currentValue]
                } else {
                    return prev
                }
            },
            [] as string[],
        )
    }

    public parseKeys(keys: string): IKeyChord {
        return parseKeysFromVimString(keys)
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

        // tslint:disable-next-line prefer-for-of
        for (let i = 0; i < boundKey.length; i++) {
            const binding = boundKey[i]

            // Does the binding pass filter?
            if (binding.filter && !binding.filter()) {
                continue
            }

            const action = binding.action
            if (typeof action === "string") {
                const result = commandManager.executeCommand(action, null)

                if (result !== false) {
                    return true
                }
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
