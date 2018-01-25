import * as assert from "assert"

import {
    createMetaKeyResolver,
    ignoreMetaKeyResolver,
    KeyResolver,
    remapResolver,
} from "./../../../src/Input/Keyboard/Resolvers"

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
        it("remaps Backspace key", () => {
            const result = remapResolver(keyBackSpace, "Backspace")
            assert.equal(result, "bs")
        })

        it("remaps Space key", () => {
            const result = remapResolver(keySpace, " ")
            assert.equal(result, "space")
        })
    })

    describe("metaResolver", () => {
        let metaResolver: KeyResolver

        describe("*", () => {
            it("Handles <s- > (shift+space)", () => {
                const layout = {
                    Space: {
                        unmodified: " ",
                        withShift: " ",
                    },
                }

                metaResolver = createMetaKeyResolver(layout)

                const key = shift(createKeyEvent(" ", "Space"))
                const result = metaResolver(key, key.key)
                assert.equal(result, "<s- >")
            })
        })

        describe("english", () => {
            beforeEach(() => {
                metaResolver = createMetaKeyResolver(englishLayout)
            })

            it("Handles <c-s-p>", () => {
                const key = control(shift(keyP))
                const result = metaResolver(key, keyP.key)

                assert.equal(result, "<s-c-p>")
            })
        })

        describe("english-intl", () => {
            beforeEach(() => {
                metaResolver = createMetaKeyResolver(englishInternationalLayout)
            })

            it("handles §", () => {
                const key = control(alt(shift(createKeyEvent("§", "KeyS"))))
                const result = metaResolver(key, key.key)
                assert.equal(result, "§")
            })
        })

        describe("german", () => {
            beforeEach(() => {
                metaResolver = createMetaKeyResolver(germanLayout)
            })

            it("Handles ö", () => {
                const key = keyUmlautedO
                const result = metaResolver(key, key.key)

                assert.equal(result, "ö")
            })

            it("Handles Ö", () => {
                const key = shift(keyUmlautedO)
                const result = metaResolver(key, key.key)

                assert.equal(result, "Ö")
            })
        })
    })
})

const englishLayout = {
    KeyP: {
        unmodified: "p",
        withShift: "P",
    },
}

const englishInternationalLayout = {
    KeyS: {
        unmodified: "s",
        withShift: "S",
        withAltGraph: "ß",
        withAltGraphShift: "§",
    },
}

const germanLayout = {
    Semicolon: {
        unmodified: "ö",
        withShift: "Ö",
    },
}

const createKeyEvent = (key: string, code: string): any => ({
    key,
    code,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    preventDefault: () => {}, // tslint:disable-line no-empty
})

const control = (keyEvent: KeyboardEvent): KeyboardEvent => ({
    ...keyEvent,
    ctrlKey: true,
})

const alt = (keyEvent: KeyboardEvent): KeyboardEvent => ({
    ...keyEvent,
    altKey: true,
})

const shift = (keyEvent: KeyboardEvent): KeyboardEvent => ({
    ...keyEvent,
    key: keyEvent.key.length === 1 ? keyEvent.key.toUpperCase() : keyEvent.key,
    shiftKey: true,
})

const keyBackSpace = createKeyEvent("Backspace", "Backspace")
const keyShift = shift(createKeyEvent("Shift", "Shift"))
const keyS = createKeyEvent("s", "KeyS")
const keyP = createKeyEvent("p", "KeyP")
const keyUmlautedO = createKeyEvent("ö", "Semicolon")
const keySpace = createKeyEvent(" ", " ")
