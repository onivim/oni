/**
 * Persisted Settings
 *
 * Simple wrapper around 'electron-settings'
 */

import { remote } from "electron"

// We need to use the 'main process' version of electron-settings.
// See: https://github.com/nathanbuchar/electron-settings/wiki/FAQs
const PersistentSettings = remote.require("electron-settings")

import { GenericConfigurationValues, IPersistedConfiguration } from "./Configuration"

export const get = <T>(key: string): T => {
    return PersistentSettings.get(key) as T
}

export const set = <T>(key: string, val: T): void => {
    return PersistentSettings.set(key, val)
}

const PersistedConfigurationKey: string = "_internal.persistedConfiguration"

export class PersistedConfiguration implements IPersistedConfiguration {
    public getPersistedValues(): GenericConfigurationValues {
        return get<GenericConfigurationValues>(PersistedConfigurationKey)
    }

    public setPersistedValues(configurationValues: GenericConfigurationValues): void {
        const currentValues = this.getPersistedValues()

        const combinedValues = {
            ...currentValues,
            ...configurationValues,
        }

        set(PersistedConfigurationKey, combinedValues)
    }
} 
