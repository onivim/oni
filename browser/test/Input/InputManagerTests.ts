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
    })
})
