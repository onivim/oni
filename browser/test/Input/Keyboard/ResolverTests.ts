import * as assert from "assert"

import { ignoreMetaKeyResolver, remapResolver, createMetaKeyResolver, KeyResolver } from "./../../../src/Input/Keyboard/Resolvers"

describe("Resolvers", () => {
    describe("ignoreMetaResolver", () => {
        it("ignores key in blacklist", () => {
            const result = ignoreMetaKeyResolver(keyShift, "Shift")
            assert.equal(result, null)
        })

        it("passes through key not in blacklist", () => {
            const result = ignoreMetaKeyResolver(keyS, "s")
            assert.equal(result, "s")
        })
    })

    describe("remapResolver", () => {
        it("remaps key in list", () => {
            const result = remapResolver(keyBackSpace, "Backspace")
            assert.equal(result, "bs")
        })
    })

    describe("metaResolver", () => {
        let metaResolver: KeyResolver

        beforeEach(() => {
            metaResolver = createMetaKeyResolver(englishLayout)
        })

        it("Handles <c-s-p>", () => {
            const key = control(shift(keyP))
            const result = metaResolver(key, keyP.key)

            assert.equal(result, "<c-s-p>")
        })
    })
})

const englishLayout = {
    "KeyP": {
        unmodified: "p",
        withShift: "P",
    }
}

const createKeyEvent = (key: string, code: string): KeyboardEvent => (<any>{
    key,
    code,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    preventDefault: () => { },
})

const control = (keyEvent: KeyboardEvent): KeyboardEvent => ({
    ...keyEvent,
    ctrlKey: true
})

const shift = (keyEvent: KeyboardEvent): KeyboardEvent => ({
    ...keyEvent,
    key: keyEvent.key.length === 1 ? keyEvent.key.toUpperCase() : keyEvent.key,
    shiftKey: true
})

const keyBackSpace = createKeyEvent("Backspace", "Backspace")
const keyShift = shift(createKeyEvent("Shift", "Shift"))
const keyS = createKeyEvent("s", "KeyS")
const keyP = createKeyEvent("p", "KeyP")

