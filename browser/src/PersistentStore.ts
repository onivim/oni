/**
 * Store.ts
 *
 * Abstraction for a persistent data store, that supports versioning and upgrade.
 */

import { remote } from "electron"

import * as Log from "./Log"

// We need to use the 'main process' version of electron-settings.
// See: https://github.com/nathanbuchar/electron-settings/wiki/FAQs
const PersistentSettings = remote.require("electron-settings")

export interface IPersistentStore<T> {
    get(): Promise<T>
    set(value: T): Promise<void>
}

export const getPersistentStore = <T>(
    storeIdentifier: string,
    defaultValue: T,
    currentVersion: number = 0,
): IPersistentStore<T> => {
    return new PersistentStore<T>(storeIdentifier, defaultValue, currentVersion)
}

export interface IPersistedValueWithMetadata<T> {
    schemaVersion: number
    value: T
}

export class PersistentStore<T> implements IPersistentStore<T> {
    private _currentValue: IPersistedValueWithMetadata<T> = null

    constructor(
        private _storeKey: string,
        private _defaultValue: T,
        private _currentVersion: number,
    ) {
        let val = null
        try {
            val = JSON.parse(PersistentSettings.get(this._storeKey))
        } catch (ex) {
            Log.warn("Error deserializing from store: " + ex)
        }

        this._currentValue = val

        if (!this._currentValue) {
            this._currentValue = {
                value: this._defaultValue,
                schemaVersion: this._currentVersion,
            }
        }

        // TODO: Check if _currentVersion is ahead of the value,
        // if so, upgrade
    }

    public async get(): Promise<T> {
        return this._currentValue.value
    }

    public async set(val: T): Promise<void> {
        this._currentValue = {
            value: val,
            schemaVersion: this._currentVersion,
        }

        PersistentSettings.set(this._storeKey, JSON.stringify(this._currentValue))
    }
}
