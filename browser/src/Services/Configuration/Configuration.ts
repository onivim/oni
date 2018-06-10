/**
 * Configuration.ts
 */

import { merge } from "lodash"
import * as Oni from "oni-api"
import * as Log from "oni-core-logging"
import { Event, IDisposable, IEvent } from "oni-types"
import { applyDefaultKeyBindings } from "./../../Input/KeyBindings"
import * as Performance from "./../../Performance"
import { diff } from "./../../Utility"

import { IConfigurationEditor, JavaScriptConfigurationEditor } from "./ConfigurationEditor"
import { DefaultConfiguration } from "./DefaultConfiguration"
import { checkDeprecatedSettings } from "./DeprecatedConfigurationValues"
import { FileConfigurationProvider } from "./FileConfigurationProvider"
import { IConfigurationValues } from "./IConfigurationValues"
import { PersistedConfiguration } from "./PersistentSettings"
import * as UserConfiguration from "./UserConfiguration"

export interface IConfigurationProvider {
    onConfigurationChanged: IEvent<void>
    onConfigurationError: IEvent<Error>

    getValues(): GenericConfigurationValues
    getLastError(): Error | null

    activate(api: Oni.Plugin.Api): void
    deactivate(): void
}

export interface GenericConfigurationValues {
    [configKey: string]: any
}

interface ConfigurationProviderInfo {
    disposables: IDisposable[]
}

export interface IConfigurationSettingValueChangedEvent<T> {
    newValue: T
    oldValue?: T
}

export interface IConfigurationSetting<T> extends IDisposable {
    onValueChanged: IEvent<IConfigurationSettingValueChangedEvent<T>>
    getValue(): T
}

export type ConfigurationSettingMergeStrategy<T> = (
    higherPrecedenceValue: T,
    lowerPrecedenceValue: T,
) => T

export interface IConfigurationSettingMetadata<T> {
    defaultValue?: T

    // Comment that will be shown in the generated configuration
    // metadata section
    description?: string

    // Whether or not the configuration value requires reloading
    // the editor to be picked up. If the value can be incrementally
    // applied, set this to true so we don't prompt the user to
    // reload the editor.
    requiresReload?: boolean

    // TODO: Implement a merge strategy
    // Specifies the merge strategy for a configuration setting
    // By default, the higher precedence setting will be returned,
    // but for things like arrays or objects, there may be a more
    // involved merge strategy.
    // mergeStrategy?: ConfigurationSettingMergeStrategy<T>
}

const DefaultConfigurationSettings: IConfigurationSettingMetadata<any> = {
    defaultValue: null,
    description: null,
    requiresReload: true,
    // mergeStrategy: (higher: any, lower: any): any => higher,
}

/**
 * Interface describing persistence layer for configuration
 */
export interface IPersistedConfiguration {
    getPersistedValues(): GenericConfigurationValues
    setPersistedValues(configurationValues: GenericConfigurationValues): void
}

export interface IConfigurationUpdateEvent {
    requiresReload: boolean
}

export class Configuration implements Oni.Configuration {
    private _configurationProviders: IConfigurationProvider[] = []
    private _onConfigurationChangedEvent: Event<Partial<IConfigurationValues>> = new Event<
        Partial<IConfigurationValues>
    >()
    private _onConfigurationErrorEvent: Event<Error> = new Event<Error>()

    private _onConfigurationUpdatedEvent = new Event<IConfigurationUpdateEvent>()

    private _oniApi: Oni.Plugin.Api = null
    private _config: GenericConfigurationValues = {}

    private _setValues: { [configValue: string]: any } = {}
    private _fileToProvider: { [key: string]: IConfigurationProvider } = {}
    private _configProviderInfo = new Map<IConfigurationProvider, ConfigurationProviderInfo>()
    private _configurationEditors: { [key: string]: IConfigurationEditor } = {}

    private _settingMetadata: { [settingName: string]: IConfigurationSettingMetadata<any> } = {}
    private _subscriptions: {
        [settingName: string]: Array<Event<IConfigurationSettingValueChangedEvent<any>>>
    } = {}

    public get editor(): IConfigurationEditor {
        const val = this.getValue("configuration.editor")
        return this._configurationEditors[val] || new JavaScriptConfigurationEditor()
    }

    public get onConfigurationError(): IEvent<Error> {
        return this._onConfigurationErrorEvent
    }

    public get onConfigurationChanged(): IEvent<Partial<IConfigurationValues>> {
        return this._onConfigurationChangedEvent
    }

    public get onConfigurationUpdated(): IEvent<IConfigurationUpdateEvent> {
        return this._onConfigurationUpdatedEvent
    }

    constructor(
        private _defaultConfiguration: GenericConfigurationValues = DefaultConfiguration,
        private _persistedConfiguration: IPersistedConfiguration = new PersistedConfiguration(),
    ) {
        this._updateConfig()
    }

    public start(): void {
        Performance.mark("Config.load.start")

        this.addConfigurationFile(UserConfiguration.getUserConfigFilePath())

        Performance.mark("Config.load.end")
    }

    public registerSetting<T>(
        name: string,
        options: IConfigurationSettingMetadata<T> = DefaultConfigurationSettings,
    ): IConfigurationSetting<T> {
        this._settingMetadata[name] = options

        const currentValue = this.getValue(name, null)

        if (options.defaultValue && currentValue === null) {
            this.setValue(name, options.defaultValue)
        }

        const newEvent = new Event<IConfigurationSettingValueChangedEvent<any>>()
        const subs: Array<Event<IConfigurationSettingValueChangedEvent<any>>> =
            this._subscriptions[name] || []
        this._subscriptions[name] = [...subs, newEvent]

        const dispose = () => {
            this._subscriptions[name] = this._subscriptions[name].filter(e => e !== newEvent)
        }

        const getValue = () => {
            return this.getValue(name)
        }

        return {
            onValueChanged: newEvent,
            dispose,
            getValue,
        }
    }

    public registerEditor(id: string, editor: IConfigurationEditor): void {
        this._configurationEditors[id] = editor
    }

    public addConfigurationFile(filePath: string): void {
        Log.info("[Configuration] Adding file: " + filePath)
        const fp = new FileConfigurationProvider(filePath)
        this.addConfigurationProvider(fp)
        this._fileToProvider[filePath] = fp
    }

    public removeConfigurationFile(filePath: string): void {
        Log.info("[Configuration] Removing file: " + filePath)
        const configProvider = this._fileToProvider[filePath]

        if (configProvider) {
            this.removeConfigurationProvider(configProvider)
            this._fileToProvider[filePath] = null
        }
    }

    public getErrors(): Error[] {
        return this._configurationProviders.map(cfp => cfp.getLastError())
    }

    public addConfigurationProvider(configurationProvider: IConfigurationProvider): void {
        this._configurationProviders.push(configurationProvider)

        const d1 = configurationProvider.onConfigurationChanged.subscribe(() => {
            Log.info("[Configuration] Got update.")
            this._updateConfig()
        })

        const d2 = configurationProvider.onConfigurationError.subscribe(error => {
            this._onConfigurationErrorEvent.dispatch(error)
        })

        this._configProviderInfo.set(configurationProvider, {
            disposables: [d1, d2],
        })

        this._updateConfig()
    }

    public removeConfigurationProvider(configurationProvider: IConfigurationProvider): void {
        this._configurationProviders = this._configurationProviders.filter(
            prov => prov !== configurationProvider,
        )

        const configurationInfo = this._configProviderInfo.get(configurationProvider)
        configurationInfo.disposables.forEach(dispose => dispose.dispose())

        this._configProviderInfo.delete(configurationProvider)

        this._updateConfig()
    }

    public hasValue(configValue: keyof IConfigurationValues): boolean {
        return !!this.getValue(configValue)
    }

    public setValue(valueName: string, value: any, persist: boolean = false): void {
        return this.setValues({ [valueName]: value }, persist)
    }

    public setValues(configValues: { [configValue: string]: any }, persist: boolean = false): void {
        this._setValues = configValues

        const oldValues = {
            ...this._config,
        }

        this._config = {
            ...this._config,
            ...configValues,
        }

        if (persist) {
            this._persistedConfiguration.setPersistedValues(configValues)
        }

        this._onConfigurationChangedEvent.dispatch(configValues)

        this._notifySubscribers(oldValues, this._config, Object.keys(configValues))
    }

    public getValue<K extends keyof IConfigurationValues>(configValue: K, defaultValue?: any) {
        if (typeof this._config[configValue] === "undefined") {
            return defaultValue
        } else {
            return this._config[configValue]
        }
    }

    public getValues(): GenericConfigurationValues {
        return { ...this._config }
    }

    public activate(oni: Oni.Plugin.Api): void {
        this._oniApi = oni

        this._activateIfOniObjectIsAvailable()
    }

    public getMetadata<T>(settingName: string): IConfigurationSettingMetadata<T> {
        return this._settingMetadata[settingName] || null
    }

    private _updateConfig(): void {
        const previousConfig = this._config
        // Need a deep merge here to recursively update the config
        let currentConfig = merge(
            this._defaultConfiguration,
            this._persistedConfiguration.getPersistedValues(),
            this._setValues,
        )

        this._configurationProviders.forEach(configProvider => {
            const configurationValues = configProvider.getValues()
            currentConfig = { ...currentConfig, ...configurationValues }
        })

        this._config = currentConfig

        checkDeprecatedSettings(this._config)

        this._deactivate()
        this._activateIfOniObjectIsAvailable()

        this._notifyListeners(previousConfig)
    }

    private _activateIfOniObjectIsAvailable(): void {
        if (this._oniApi) {
            applyDefaultKeyBindings(this._oniApi, this)
            this._configurationProviders.forEach(configurationProvider =>
                configurationProvider.activate(this._oniApi),
            )
        }
    }

    private _deactivate(): void {
        this._configurationProviders.forEach(configurationProvider =>
            configurationProvider.deactivate(),
        )
        if (this._config && this._config.deactivate) {
            this._config.deactivate()
        }
    }

    private _notifyListeners(previousConfig?: Partial<IConfigurationValues>): void {
        previousConfig = previousConfig || {}

        const changedValues = diff(this._config, previousConfig)

        const diffObject = changedValues.reduce(
            (previous: Partial<IConfigurationValues>, current: string) => {
                const currentValue = this._config[current]

                // Skip functions, because those will always be different
                if (currentValue && typeof currentValue === "function") {
                    return previous
                }

                return {
                    ...previous,
                    [current]: this._config[current],
                }
            },
            {},
        )

        this._onConfigurationChangedEvent.dispatch(diffObject)

        this._notifySubscribers(previousConfig, this._config, Object.keys(diffObject))
    }

    private _notifySubscribers(oldValues: any, newValues: any, changedKeys: string[]): void {
        let requiresReload = false
        changedKeys.forEach(name => {
            const settings = this._subscriptions[name]

            const metadata = this.getMetadata(name)

            requiresReload = requiresReload || !metadata || metadata.requiresReload

            if (!settings) {
                return
            }

            const args = {
                oldValue: oldValues[name],
                newValue: newValues[name],
            }

            settings.forEach(evt => evt.dispatch(args))
        })

        this._onConfigurationUpdatedEvent.dispatch({ requiresReload: true })
    }
}

export const configuration = new Configuration()
