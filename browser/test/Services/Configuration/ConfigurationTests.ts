import * as assert from "assert"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import {
    Configuration,
    GenericConfigurationValues,
    IConfigurationProvider,
    IPersistedConfiguration,
} from "./../../../src/Services/Configuration"

describe("Configuration", () => {
    it("has default configuration values set on instantiation", () => {
        const configuration = new Configuration({ "test.config": 1 })

        assert.strictEqual(configuration.getValue("test.config"), 1)
    })

    it("has default values overridden by provider", () => {
        const configuration = new Configuration({ "test.config": 1 })

        const configProvider = new MockConfigurationProvider({ "test.config": 2 })

        configuration.addConfigurationProvider(configProvider)

        assert.strictEqual(configuration.getValue("test.config"), 2)
    })

    it("triggers error event when provider has an error", () => {
        const configuration = new Configuration({})

        const errors: Error[] = []
        configuration.onConfigurationError.subscribe(err => {
            errors.push(err)
        })

        const configProvider = new MockConfigurationProvider({})

        configuration.addConfigurationProvider(configProvider)
        configProvider.simulateError(new Error("test error"))

        assert.strictEqual(errors.length, 1, "Validate an error was captured")
    })

    it("triggers change event when provider has an update", () => {
        const configuration = new Configuration({ "test.config": 1 })

        const configProvider = new MockConfigurationProvider({ "test.config": 2 })
        configuration.addConfigurationProvider(configProvider)

        let hitCount = 0
        configuration.onConfigurationChanged.subscribe(() => {
            hitCount++
        })

        configProvider.simulateConfigChange({ "test.config": 3 })

        assert.strictEqual(hitCount, 1, "Validate 'onConfigurationChanged' was dispatched")
        assert.strictEqual(
            configuration.getValue("test.config"),
            3,
            "Validate configuration was updated",
        )
    })

    it("triggers updated event with requireReload true", () => {
        const configuration = new Configuration({ "test.config": 1 })
        let hitCount = 0

        configuration.onConfigurationUpdated.subscribe(evt => {
            hitCount++
            assert.strictEqual(evt.requiresReload, true, "Validate requiresReload is set to true")
        })

        configuration.setValue("test.config", 2)

        assert.strictEqual(hitCount, 1, "Validate event handler was triggered")
    })

    describe("removeConfigurationProvider", () => {
        it("removes configuration value supplied by provider", () => {
            const configuration = new Configuration({ "test.config": 1 })

            const configProvider = new MockConfigurationProvider({ "test.config": 2 })
            configuration.addConfigurationProvider(configProvider)
            configuration.removeConfigurationProvider(configProvider)

            assert.strictEqual(
                configuration.getValue("test.config"),
                1,
                "Value should now be 1 since the provider was removed",
            )
        })

        it("doesn't listen to events from removed provider", () => {
            const configuration = new Configuration({ "test.config": 1 })

            const configProvider = new MockConfigurationProvider({ "test.config": 2 })
            configuration.addConfigurationProvider(configProvider)

            let changeHitCount = 0
            let errorHitCount = 0

            configuration.onConfigurationChanged.subscribe(() => changeHitCount++)
            configuration.onConfigurationError.subscribe(() => errorHitCount++)

            configuration.removeConfigurationProvider(configProvider)

            assert.strictEqual(
                changeHitCount,
                1,
                "Should've been one change when applying settings after remove",
            )

            configProvider.simulateConfigChange({ "test.config": 3 })
            assert.strictEqual(
                changeHitCount,
                1,
                "Validate change hit count is still 1, since we shouldn't be listening to the removed config provider",
            )
            assert.strictEqual(
                configuration.getValue("test.config"),
                1,
                "Validate the value is still at 1",
            )

            configProvider.simulateError(new Error("some error"))
            assert.strictEqual(
                errorHitCount,
                0,
                "Validate there was no event triggered for the removed providers error event",
            )
        })
    })

    describe("registerConfigurationSetting", () => {
        it("sets default value", () => {
            const configuration = new Configuration()
            configuration.registerSetting("test.setting", {
                defaultValue: 1,
            })

            const val = configuration.getValue("test.setting")
            assert.strictEqual(val, 1, "Validate default value gets set")
        })

        it("notifies when value is changed", () => {
            const configuration = new Configuration()
            const setting = configuration.registerSetting("test.setting", {
                defaultValue: 1,
            })

            let val: number = null
            let oldVal: number = null
            setting.onValueChanged.subscribe(evt => {
                val = evt.newValue
                oldVal = evt.oldValue
            })

            configuration.setValue("test.setting", 2)
            assert.strictEqual(val, 2, "Validate new value was populated in event handler")
            assert.strictEqual(oldVal, 1, "Validate the oldValue was set correctly")
        })

        it("disposed setting no longer receives notifications", () => {
            const configuration = new Configuration()
            const setting = configuration.registerSetting("test.setting", {
                defaultValue: 1,
            })

            let hitCount = 0
            setting.onValueChanged.subscribe(() => {
                hitCount++
            })

            setting.dispose()
            configuration.setValue("test.setting", 2)

            assert.strictEqual(hitCount, 0, "Event should not have been fired")
        })

        it("setting metadata is available via the getMetadata call", () => {
            const configuration = new Configuration()
            configuration.registerSetting("test.setting", {
                description: "test",
                defaultValue: 1,
            })

            const metadata = configuration.getMetadata("test.setting")
            assert.strictEqual(metadata.description, "test")
        })

        // TODO:
        // it("applies merge strategy", () => {
        //     const configuration = new Configuration()

        //     configuration.registerSetting<string>("test.config", {
        //         defaultValue: "",
        //         mergeStrategy: (high, low) => high + low
        //     })

        //     const lowPriorityProvider = new MockConfigurationProvider({ "test.config": "a" })
        //     const highPriorityProvider = new  MockConfigurationProvider({"test.config": "b"})

        //     configuration.addConfigurationProvider(lowPriorityProvider)
        //     configuration.addConfigurationProvider(highPriorityProvider)

        //     const val = configuration.getValue("test.config")
        //     assert.strictEqual(val, "ba", "Validate merge strategy is executed")
        // })
    })

    describe("persisted configuration", () => {
        let persistedConfiguration: IPersistedConfiguration

        beforeEach(() => {
            persistedConfiguration = new MockPersistedConfiguration()
        })

        it("reads persisted values", () => {
            persistedConfiguration.setPersistedValues({
                "test.config": 2,
            })
            const configuration = new Configuration({ "test.config": 1 }, persistedConfiguration)
            assert.strictEqual(
                configuration.getValue("test.config"),
                2,
                "Validate persisted configuration value is read",
            )
        })

        it("are overwritten by explicitly set configuration values", () => {
            persistedConfiguration.setPersistedValues({
                "test.config": 2,
            })

            const configProvider = new MockConfigurationProvider({ "test.config": 3 })

            const configuration = new Configuration({ "test.config": 1 }, persistedConfiguration)
            configuration.addConfigurationProvider(configProvider)
            assert.strictEqual(
                configuration.getValue("test.config"),
                3,
                "Validate persisted configuration is overwrittten by explicitly set configuration",
            )
        })

        it("doesn't set values when 'persist' argument is false", () => {
            persistedConfiguration.setPersistedValues({
                "test.config": 1,
            })

            const configuration = new Configuration({ "test.config": 1 }, persistedConfiguration)

            configuration.setValues({ "test.config": 2 }, false)

            assert.deepEqual(
                persistedConfiguration.getPersistedValues(),
                {
                    "test.config": 1,
                },
                "Validate persisted configuration wasn't overwritten since persist was false",
            )
        })

        it("does set values when 'persist' argument is true", () => {
            const configuration = new Configuration({ "test.config": 1 }, persistedConfiguration)

            configuration.setValues({ "test.config": 2 }, true)

            assert.deepEqual(
                persistedConfiguration.getPersistedValues(),
                {
                    "test.config": 2,
                },
                "Validate persisted configuration was overwritten since persist was true",
            )
        })
    })
})

export class MockPersistedConfiguration implements IPersistedConfiguration {
    private _values: GenericConfigurationValues = {}

    public getPersistedValues(): GenericConfigurationValues {
        return this._values
    }

    public setPersistedValues(configurationValues: GenericConfigurationValues): void {
        this._values = configurationValues
    }
}

export class MockConfigurationProvider implements IConfigurationProvider {
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
