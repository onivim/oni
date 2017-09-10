/**
 * Configuration.ts
 *
 * Implementation of configuration object
 *
 * Used for reading configuration values and listening to configuration changes
 */

import { Event, IEvent } from "./../../Event"

import * as Config from "./../../Config"

/**
 * API instance for interacting with Oni (and vim)
 */
export class Configuration {

    public get onConfigurationChangedEvent(): IEvent<void> {
        return this._onConfigurationChangedEvent
    }

    private _onConfigurationChangedEvent: Event<void> = new Event<void>("oni_configuration_changed")

    constructor() {
        Config.instance().onConfigChanged.subscribe(() => {
            this._onConfigurationChangedEvent.dispatch(null)
        })
    }

    public getValue<T>(configValue: string, defaultValue?: T): T {
        return Config.instance().getValue(configValue as any) || defaultValue
    }

}
