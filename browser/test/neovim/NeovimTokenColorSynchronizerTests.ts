/**
 * NeovimTokenColorSynchronizerTests.ts
 */

import * as assert from "assert"

import { NeovimTokenColorSynchronizer } from "./../../src/neovim/NeovimTokenColorSynchronizer"
import { TokenColor } from "./../../src/Services/TokenColors"

import { MockNeovimInstance } from "./../Mocks/neovim"

const createTokenColor = (scope: string): TokenColor => ({
    scope,
    settings: {
        foreground: "#FFFFFF",
        background: "#FF0000",
        fontStyle: null,
    },
})

describe("NeovimTokenColorSynchronizer", () => {
    let neovimInstance: MockNeovimInstance
    let tokenColorSynchronizer: NeovimTokenColorSynchronizer

    beforeEach(() => {
        neovimInstance = new MockNeovimInstance()
        tokenColorSynchronizer = new NeovimTokenColorSynchronizer(neovimInstance as any)
    })

    describe("synchronizeTokenColors", () => {
        it("adds token color if it doesn't exist", async () => {
            const color = createTokenColor("test.scope")
            const promise = tokenColorSynchronizer.synchronizeTokenColors([color])
            const pendingRequests = neovimInstance.getPendingRequests()

            const firstRequest = pendingRequests[0]
            assert.strictEqual(firstRequest.requestName, "nvim_call_atomic")

            const subRequests = pendingRequests[0].args
            assert.strictEqual(subRequests.length, 1)

            const [subRequestName, subRequestArgs] = subRequests[0][0]

            assert.strictEqual(subRequestName, "nvim_command")
            assert.ok(subRequestArgs[0].indexOf("guibg=#FF0000"))
            assert.ok(subRequestArgs[0].indexOf("guifg=#FFFFFF"))

            neovimInstance.flushPendingRequests()

            await promise
        })

        it("doesn't add token color if it already exists", async () => {
            // Add a token color...
            const color = createTokenColor("test.scope")
            const promise = tokenColorSynchronizer.synchronizeTokenColors([color])

            neovimInstance.flushPendingRequests()
            await promise

            // ...now add it again
            const promise2 = tokenColorSynchronizer.synchronizeTokenColors([color])

            // Validate there were no pending requests
            assert.strictEqual(neovimInstance.getPendingRequests().length, 0)
            await promise2
        })
    })
})
