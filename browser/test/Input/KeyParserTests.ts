/**
 * KeyParserTests.ts
 */

import * as assert from "assert"

import * as KeyParser from "./../../src/Input/KeyParser"

describe("KeyParser", () => {
    describe("parseKeysFromVimString", () => {
        it("parses a basic key", () => {
            const result = KeyParser.parseKeysFromVimString("a")

            assert.deepEqual(result.chord, [
                { character: "a", shift: false, alt: false, control: false, meta: false },
            ])
        })

        it("parses multiple keys in a row", () => {
            const result = KeyParser.parseKeysFromVimString("ab")
            assert.deepEqual(result.chord, [
                { character: "a", shift: false, alt: false, control: false, meta: false },
                { character: "b", shift: false, alt: false, control: false, meta: false },
            ])
        })

        it("parses modifier keys", () => {
            const result = KeyParser.parseKeysFromVimString("<c-a>")
            assert.deepEqual(result.chord, [
                { character: "a", shift: false, alt: false, control: true, meta: false },
            ])
        })
    })
})
