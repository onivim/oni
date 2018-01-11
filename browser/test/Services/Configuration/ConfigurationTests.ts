import * as assert from "assert"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import { Configuration, GenericConfigurationValues, IConfigurationProvider } from "./../../../src/Services/Configuration"

export class MockConfigurationProvder implements IConfigurationProvider {
    private _onConfigurationChangedEvent = new Event<void>()
    private _onConfigurationErrorEvent = new Event<Error>()

    private _values: GenericConfigurationValues = {}
    private _lastError: Error | null = null

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
        return this._lastError
    }

    public activate(api: Oni.Plugin.Api): void {
        // tslint:disable-line
    }

    public deactivate(): void {
        // tslint:disable-line
    }

    public simulateConfigChange(newValues: GenericConfigurationValues): void {
        this._values = newValues
        this._onConfigurationChangedEvent.dispatch()
    }

    public simulateError(err: Error): void {
        this._lastError = err
        this._onConfigurationErrorEvent.dispatch(err)
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

    it("triggers error event when provider has an error", () => {
        const configuration = new Configuration({})

        const errors: Error[] = []
        configuration.onConfigurationError.subscribe((err) => {
            errors.push(err)
        })

        const configProvider = new MockConfigurationProvder({})

        configuration.addConfigurationProvider(configProvider)
        configProvider.simulateError(new Error("test error"))

        assert.strictEqual(errors.length, 1, "Validate an error was captured")
    })

    it("triggers change event when provider has an update", () => {
        const configuration = new Configuration({ "test.config": 1 })

        const configProvider = new MockConfigurationProvder({ "test.config": 2 })
        configuration.addConfigurationProvider(configProvider)

        let hitCount = 0
        configuration.onConfigurationChanged.subscribe(() => {
            hitCount++
        })

        configProvider.simulateConfigChange({ "test.config": 3})

        assert.strictEqual(hitCount, 1, "Validate 'onConfigurationChanged' was dispatched")
        assert.strictEqual(configuration.getValue("test.config"), 3, "Validate configuration was updated")
    })
})
