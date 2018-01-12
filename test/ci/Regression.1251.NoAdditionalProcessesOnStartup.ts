/**
 * Regression test for #1251
 */

import * as assert from "assert"

import * as Oni from "oni-api"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    const process = oni.process as any
    const pids = process.getPIDs()

    assert.strictEqual(pids.length, 2, "Validate that only two processes were spawned on startup")
}
