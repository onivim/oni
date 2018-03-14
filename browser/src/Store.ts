/**
 * Store.ts
 *
 * Abstraction for a persistent data store, that supports versioning and upgrade.
 */

import { remote } from "electron"

// We need to use the 'main process' version of electron-settings.
// See: https://github.com/nathanbuchar/electron-settings/wiki/FAQs
const PersistentSettings = remote.require("electron-settings")

export interface IStore<T> {
    get(): Promise<T>
    set(value: T): Promise<void>
}

export const getStore = <T>(
    storeIdentifier: string,
    defaultValue: T,
    currentVersion: number = 0,
): IStore<T> => {
    return new Store<T>(storeIdentifier, defaultValue, currentVersion)
}

export interface IPersistedValueWithMetadata<T> {
    schemaVersion: number
    value: T
}

export class Store<T> implements IStore<T> {
    private _currentValue: IPersistedValueWithMetadata<T> = null

    constructor(
        private _storeKey: string,
        private _defaultValue: T,
        private _currentVersion: number,
    ) {
        this._currentValue = PersistentSettings.get(this._storeKey)

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

        PersistentSettings.set(this._storeKey, this._currentValue)
    }
}
