/**
 * ProcessTests.ts
 */

import * as assert from "assert"

import { Process } from "./../../../src/Plugins/Api/Process"

describe("ProcessTests", () => {
    it("mergeSpawnOptions takes into account shell environment", async () => {
        const env = { test2: "true" } as NodeJS.ProcessEnv
        const mockShellEnvFetcher = {
            getEnvironmentVariables: () => Promise.resolve(env),
        }

        const process = new Process(mockShellEnvFetcher)

        const newOptions = await process.mergeSpawnOptions({
            env: {
                test1: "true",
            },
        })

        assert.strictEqual(newOptions.env.test1, "true")
        assert.strictEqual(newOptions.env.test2, "true")
    })
})
