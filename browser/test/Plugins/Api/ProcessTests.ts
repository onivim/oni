/**
 * ProcessTests.ts
 */

import * as assert from "assert"

import { IShellEnvironmentFetcher, Process } from "./../../../src/Plugins/Api/Process"

class MockShellEnvironmentFetcher implements IShellEnvironmentFetcher {
    constructor(private _env: any) {}

    public async getEnvironmentVariables(): Promise<any> {
        return this._env
    }
}

describe("ProcessTests", () => {
    it("mergeSpawnOptions takes into account shell environment", async () => {
        const mockShellEnv = new MockShellEnvironmentFetcher({ test2: true })
        const process = new Process(mockShellEnv)

        const newOptions = await process.mergeSpawnOptions({
            env: {
                test1: true,
            },
        })

        assert.strictEqual(newOptions.env.test1, true)
        assert.strictEqual(newOptions.env.test2, true)
    })
})
