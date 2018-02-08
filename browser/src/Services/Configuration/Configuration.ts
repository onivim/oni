/**
 * Configuration.ts
 */

import * as Oni from "oni-api"
import { Event, IDisposable, IEvent } from "oni-types"
import { mergeAll } from "ramda"
import { applyDefaultKeyBindings } from "./../../Input/KeyBindings"
import * as Log from "./../../Log"
import * as Performance from "./../../Performance"
import { diff } from "./../../Utility"

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

// const isNestedObject = (value: any) => isPlainObject(value) && Object.values(value).some(v => !!v && isPlainObject(v))

/**
 * Interface describing persistence layer for configuration
 */
export interface IPersistedConfiguration {
    getPersistedValues(): GenericConfigurationValues
    setPersistedValues(configurationValues: GenericConfigurationValues): void
}

export class Configuration implements Oni.Configuration {
    private _configurationProviders: IConfigurationProvider[] = []
    private _onConfigurationChangedEvent: Event<Partial<IConfigurationValues>> = new Event<
        Partial<IConfigurationValues>
    >()
    private _onConfigurationErrorEvent: Event<Error> = new Event<Error>()

    private _oniApi: Oni.Plugin.Api = null
    private _config: GenericConfigurationValues = {}

    private _setValues: { [configValue: string]: any } = {}
    private _fileToProvider: { [key: string]: IConfigurationProvider } = {}
    private _configProviderInfo = new Map<IConfigurationProvider, ConfigurationProviderInfo>()

    public get onConfigurationError(): IEvent<Error> {
        return this._onConfigurationErrorEvent
    }

    public get onConfigurationChanged(): IEvent<Partial<IConfigurationValues>> {
        return this._onConfigurationChangedEvent
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

    public setValues(configValues: { [configValue: string]: any }, persist: boolean = false): void {
        this._setValues = configValues

        this._config = {
            ...this._config,
            ...configValues,
        }

        if (persist) {
            this._persistedConfiguration.setPersistedValues(configValues)
        }

        this._onConfigurationChangedEvent.dispatch(configValues)
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

    private _updateConfig(): void {
        const previousConfig = this._config
        // Need a deep merge here to recursizely update the config
        let currentConfig = mergeAll([
            this._defaultConfiguration,
            this._persistedConfiguration.getPersistedValues(),
            this._setValues,
        ])

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
    }
}

export const configuration = new Configuration()
