/**
 * Configuration.ts
 */

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"
import { applyDefaultKeyBindings } from "./../../Input/KeyBindings"
import * as Log from "./../../Log"
import * as Performance from "./../../Performance"
import { diff } from "./../../Utility"

import { DefaultConfiguration } from "./DefaultConfiguration"
import { FileConfigurationProvider } from "./FileConfigurationProvider"
import { IConfigurationValues } from "./IConfigurationValues"
import * as UserConfiguration from "./UserConfiguration"

export interface IConfigurationProvider {
    onConfigurationChanged: IEvent<void>
    onConfigurationError: IEvent<Error>

    getValues(): Partial<IConfigurationValues>
    getLastError(): Error | null

    activate(api: Oni.Plugin.Api): void
    deactivate(): void
}

export class Configuration implements Oni.Configuration {

    private _configurationProviders: IConfigurationProvider[] = []
    private _onConfigurationChangedEvent: Event<Partial<IConfigurationValues>> = new Event<Partial<IConfigurationValues>>()
    private _oniApi: Oni.Plugin.Api = null
    private _config: any = { }

    private _setValues: { [configValue: string]: any } = { }

    public get onConfigurationChanged(): IEvent<Partial<IConfigurationValues>> {
        return this._onConfigurationChangedEvent
    }

    public start(): void {
        Performance.mark("Config.load.start")

        this.addConfigurationFile(UserConfiguration.getUserConfigFilePath())

        Performance.mark("Config.load.end")
    }

    public addConfigurationFile(filePath: string): void {
        this.addConfigurationProvider(new FileConfigurationProvider(filePath))
    }

    public getErrors(): Error[] {
        return this._configurationProviders.map((cfp) => cfp.getLastError())
    }

    public addConfigurationProvider(configurationProvider: IConfigurationProvider): void {
        this._configurationProviders.push(configurationProvider)

        configurationProvider.onConfigurationChanged.subscribe(() => {
            Log.info("[Configuration] Got update.")
            this._updateConfig()
        })

        configurationProvider.onConfigurationError.subscribe((error) => {
            alert(error)
        })

        this._updateConfig()
    }

    public hasValue(configValue: keyof IConfigurationValues): boolean {
        return !!this.getValue(configValue)
    }

    public setValues(configValues: { [configValue: string]: any }): void {

        this._setValues = configValues

        this._config = {
            ...this._config,
            ...configValues,
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

    public getValues(): IConfigurationValues {
        return { ...this._config }
    }

    public activate(oni: Oni.Plugin.Api): void {
        this._oniApi = oni

        this._activateIfOniObjectIsAvailable()
    }

    private _updateConfig(): void {
        const previousConfig = this._config

        let currentConfig = { ...DefaultConfiguration, ...this._setValues }

        this._configurationProviders.forEach((configProvider) => {

            const configurationValues = configProvider.getValues()

            currentConfig = { ...currentConfig, ...configurationValues }
        })

        this._config = currentConfig

        this._deactivate()
        this._activateIfOniObjectIsAvailable()

        this._notifyListeners(previousConfig)
    }

    private _activateIfOniObjectIsAvailable(): void {
        if (this._oniApi) {
            applyDefaultKeyBindings(this._oniApi, this)
            this._configurationProviders.forEach((configurationProvider) => configurationProvider.activate(this._oniApi))
        }
    }

    private _deactivate(): void {
        this._configurationProviders.forEach((configurationProvider) => configurationProvider.deactivate())
        if (this._config && this._config.deactivate) {
            this._config.deactivate()
        }
    }

    private _notifyListeners(previousConfig?: Partial<IConfigurationValues>): void {
        previousConfig = previousConfig || {}

        const changedValues = diff(this._config, previousConfig)

        const diffObject = changedValues.reduce((previous: Partial<IConfigurationValues>, current: string) => {

            const currentValue = this._config[current]

            // Skip functions, because those will always be different
            if (currentValue && typeof currentValue === "function") {
                return previous
            }

            return {
                ...previous,
                [current]: this._config[current],
            }
        }, {})

        this._onConfigurationChangedEvent.dispatch(diffObject)
    }
}

export const configuration = new Configuration()
