/**
 * ProcessTests.ts
 */

import * as assert from "assert"

import { IShellEnvironmentFetcher, Process } from "./../../../src/Plugins/Api/Process"

class MockShellEnvironmentFetcher implements IShellEnvironmentFetcher {
    constructor(private _env: NodeJS.ProcessEnv) {}

    public getEnvironmentVariables() {
        return this._env
    }
}

describe("ProcessTests", () => {
    it("mergeSpawnOptions takes into account shell environment", async () => {
        const env = { test2: "true" } as NodeJS.ProcessEnv
        const mockShellEnv = new MockShellEnvironmentFetcher(env)
        const process = new Process(mockShellEnv)

        const newOptions = await process.mergeSpawnOptions({
            env: {
                test1: "true",
            },
        })

        assert.strictEqual(newOptions.env.test1, "true")
        assert.strictEqual(newOptions.env.test2, "true")
    })
})
