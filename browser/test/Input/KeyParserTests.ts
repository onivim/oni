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

    describe("parseChordParts", () => {
        it("parses modifier keys", () => {
            const tests: [string, string[]][] = [
                ["a", ["a"]],
                ["<c-a>", ["control", "a"]],
                ["<m-a>", ["meta", "a"]],
                ["<a-a>", ["alt", "a"]],
                ["<s-a>", ["shift", "a"]],
                ["<m-c-a-s-a>", ["meta", "control", "alt", "shift", "a"]],
            ]

            tests.forEach(test => {
                assert.deepEqual(KeyParser.parseChordParts(test[0]), test[1])
            })
        })

        it("ignores keys beyond the first chord", () => {
            const result = KeyParser.parseChordParts("<c-a>b")
            assert.deepEqual(result, ["control", "a"])
        })
    })
})
