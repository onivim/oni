
import test from "ava"

import { InputManager } from "../src/Services/InputManager"

test("InputManager.bind() adds a key handler", t => {

    const im = new InputManager()

    let count = 0
    im.bind("<c-a>", () => { count++; return true })

    const handled = im.handleKey("<c-a>")

    t.is(count, 1, "Validate handler was called")
    t.is(handled, true)

})

test("InputManager.bind() removes key handler when calling dispose", t => {
    const im = new InputManager()

    let count = 0
    const dispose = im.bind("<c-a>", () => { count++; return true })
    dispose()

    const handled = im.handleKey("<c-a>")

    t.is(count, 0, "Handler should not have been called")
    t.is(handled, false)
})

test("InputManager.bind() dispose key handler is robust if unbindAll was called first", t => {
    const im = new InputManager()

    let count = 0
    const dispose = im.bind("{", () => { count++; return true })

    im.unbindAll()

    dispose()

    const handled = im.handleKey("{")
    t.is(count, 0, "Handler should not have been called.")
    t.is(handled, false)
})

