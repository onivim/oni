/**
 * NeovimBufferUpdateManagerTests.ts
 */

import * as assert from "assert"
import * as os from "os"

import { EventContext } from "./../../src/neovim"
import {
    INeovimBufferUpdate,
    NeovimBufferUpdateManager,
} from "./../../src/neovim/NeovimBufferUpdateManager"

import { MockConfiguration, MockNeovimInstance } from "./../Mocks"
import { waitForAllAsyncOperations } from "./../TestHelpers"

const createTestEventContext = (bufferNumber: number, bufferTotalLines: number): EventContext => {
    return {
        bufferNumber,
        bufferTotalLines,
    } as any
}

describe("NeovimBufferUpdateManagerTests", () => {
    let configuration: MockConfiguration = null
    let neovimInstance: MockNeovimInstance = null
    let bufferUpdateManager: NeovimBufferUpdateManager = null

    beforeEach(() => {
        configuration = new MockConfiguration({ "editor.maxLinesForLanguageServices": 1000 })
        neovimInstance = new MockNeovimInstance()

        bufferUpdateManager = new NeovimBufferUpdateManager(
            configuration as any,
            neovimInstance as any,
        )
    })

    it("dispatches when there is a full update", async () => {
        const evt = createTestEventContext(1, 100)
        bufferUpdateManager.notifyFullBufferUpdate(evt)

        let hitCount = 0
        bufferUpdateManager.onBufferUpdate.subscribe(() => hitCount++)

        assert.strictEqual(neovimInstance.getPendingRequests().length, 1)

        neovimInstance.flushFirstRequest(["a", "b", "c"])
        await waitForAllAsyncOperations()

        assert.strictEqual(hitCount, 1, "Validate 'onBufferUpdate' was dispatched")
    })

    it("debounces multiple full updates, while a request is pending", async () => {
        let hitCount = 0
        let lastResult: INeovimBufferUpdate = null
        bufferUpdateManager.onBufferUpdate.subscribe(result => {
            lastResult = result
            hitCount++
        })

        // Send five requests
        const evt1 = createTestEventContext(1, 100)
        const evt2 = createTestEventContext(1, 101)
        const evt3 = createTestEventContext(1, 102)
        const evt4 = createTestEventContext(1, 104)
        const evt5 = createTestEventContext(1, 105)

        bufferUpdateManager.notifyFullBufferUpdate(evt1)
        bufferUpdateManager.notifyFullBufferUpdate(evt2)
        bufferUpdateManager.notifyFullBufferUpdate(evt3)
        bufferUpdateManager.notifyFullBufferUpdate(evt4)
        bufferUpdateManager.notifyFullBufferUpdate(evt5)

        // Validate there is only a _single_ request queued up
        assert.strictEqual(neovimInstance.getPendingRequests().length, 1)

        neovimInstance.flushFirstRequest(["a", "b", "c"])
        await waitForAllAsyncOperations()

        // Validate there is now _another_ request queued up
        assert.strictEqual(neovimInstance.getPendingRequests().length, 1)
        const firstRequest = neovimInstance.getPendingRequests()[0]

        // Validate the request corresponds to the last item
        assert.strictEqual(firstRequest.args[2] /* 3rd parameter - totalBufferLines */, 105)

        neovimInstance.flushFirstRequest(["d", "e", "f"])
        await waitForAllAsyncOperations()

        assert.strictEqual(
            hitCount,
            2,
            "Validate the onBufferUpdate event was dispatched twice - first on the leading and second on the trailing call",
        )
        assert.strictEqual(lastResult.contentChanges[0].text, ["d", "e", "f"].join(os.EOL))

        // Validate there are no additional pending requests
        assert.strictEqual(neovimInstance.getPendingRequests().length, 0)
    })
})
