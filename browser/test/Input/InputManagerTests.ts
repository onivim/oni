import * as assert from "assert"

import { InputManager } from "./../../src/Services/InputManager"

describe("InputManager", () => {
    describe("bind", () => {
        it("adds a key handler", () => {
            const im = new InputManager()

            let count = 0
            im.bind("<c-a>", () => {
                count++
                return true
            })

            const handled = im.handleKey("<c-a>")

            assert.strictEqual(count, 1, "Validate handler was called")
            assert.strictEqual(handled, true)
        })

        it("removes key handler when calling dispose", () => {
            const im = new InputManager()

            let count = 0
            const dispose = im.bind("<c-a>", () => {
                count++
                return true
            })
            dispose()

            const handled = im.handleKey("<c-a>")

            assert.strictEqual(count, 0, "Handler should not have been called")
            assert.strictEqual(handled, false)
        })

        it("dispose key handler is robust if unbindAll was called first", () => {
            const im = new InputManager()

            let count = 0
            const dispose = im.bind("{", () => {
                count++
                return true
            })

            im.unbindAll()

            dispose()

            const handled = im.handleKey("{")
            assert.strictEqual(count, 0, "Handler should not have been called.")
            assert.strictEqual(handled, false)
        })

        describe("getBoundKeys", () => {
            it("returns empty array if no key bound to command", () => {
                const im = new InputManager()

                const boundKeys = im.getBoundKeys("test.command")
                assert.deepEqual(boundKeys, [], "Validate no keys bound")
            })

            it("returns key bound to command", () => {
                const im = new InputManager()
                im.bind("<c-a>", "test.command")

                const boundKeys = im.getBoundKeys("test.command")
                assert.deepEqual(boundKeys, ["<c-a>"], "Validate the bound key is returned")
            })

            it("does not return key if bound and then unbind", () => {
                const im = new InputManager()
                const unbind = im.bind("<c-a>", "test.command")

                unbind()

                const boundKeys = im.getBoundKeys("test.command")
                assert.deepEqual(boundKeys, [], "Validate no bound keys are returned")
            })
        })
    })
})
