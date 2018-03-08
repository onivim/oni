/**
 * FileConfigurationProviderTests.ts
 */

import * as assert from "assert"

import { promoteConfigurationToRootLevel } from "./../../../src/Services/Configuration/FileConfigurationProvider"

describe("FileConfigurationProviderTests", () => {
    describe("promoteConfigurationToRootLevel", () => {
        it("passes through configuration if no configuration object", async () => {
            const val = promoteConfigurationToRootLevel({
                test1: 1,
            })

            assert.deepEqual(val, { test1: 1 })
        })

        it("promotes configuration object", async () => {
            const val = promoteConfigurationToRootLevel({
                test1: 1,
                configuration: {
                    test2: 2,
                },
            })

            assert.deepEqual(val, { test1: 1, test2: 2 })
        })
    })
})
