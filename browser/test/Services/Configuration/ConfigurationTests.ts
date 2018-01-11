import * as assert from "assert"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import { Configuration, GenericConfigurationValues, IConfigurationProvider } from "./../../../src/Services/Configuration"

export class MockConfigurationProvder implements IConfigurationProvider {
    private _onConfigurationChangedEvent = new Event<void>()
    private _onConfigurationErrorEvent = new Event<Error>()

    private _values: GenericConfigurationValues = {}

    public get onConfigurationChanged(): IEvent<void> {
        return this._onConfigurationChangedEvent
    }

    public get onConfigurationError(): IEvent<Error> {
        return this._onConfigurationErrorEvent
    }

    constructor(initialValues: GenericConfigurationValues) {
        this._values = initialValues
    }

    public getValues(): GenericConfigurationValues {
        return this._values
    }

    public getLastError(): Error | null {
        return null
    }

    public activate(api: Oni.Plugin.Api): void {
        // tslint:disable-line
    }

    public deactivate(): void {
        // tslint:disable-line
    }
}

describe("Configuration", () => {
    it("has default configuration values set on instantiation", () => {
        const configuration = new Configuration({ "test.config": 1 })

        assert.strictEqual(configuration.getValue("test.config"), 1)
    })

    it("has default values overridden by provider", () => {
        const configuration = new Configuration({ "test.config": 1 })

        const configProvider = new MockConfigurationProvder({ "test.config": 2 })

        configuration.addConfigurationProvider(configProvider)

        assert.strictEqual(configuration.getValue("test.config"), 2)
    })
})
