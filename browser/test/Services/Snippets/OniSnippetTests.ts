import * as assert from "assert"

import { getLineCharacterFromOffset, OniSnippet } from "./../../../src/Services/Snippets/OniSnippet"

describe("getLineCharacterFromOffset", () => {
    it("handles single line case", () => {
        const lines = ["foo"]

        const result = getLineCharacterFromOffset(1, lines)
        assert.deepEqual(result, { line: 0, character: 1 })
    })

    it("handles multi-line case", () => {
        const lines = ["foo", "bar"]

        // '4' instead of '3' because of the new line...
        const result = getLineCharacterFromOffset(4, lines)

        assert.deepEqual(result, { line: 1, character: 0 })
    })
})

describe("OniSnippet", () => {
    describe("getLines", () => {
        it("splits based on '\\n'", () => {
            const oniSnippet = new OniSnippet("foo\nbar")

            const lines = oniSnippet.getLines()

            assert.deepEqual(lines, ["foo", "bar"], "Validate lines are split correctly")
        })

        it("splits based on '\\r\\n'", () => {
            const oniSnippet = new OniSnippet("foo\r\nbar")

            const lines = oniSnippet.getLines()

            assert.deepEqual(lines, ["foo", "bar"], "Validate lines are split correctly")
        })
    })

    describe("getPlaceholders", () => {
        it("gets single placeholder", () => {
            const oniSnippet = new OniSnippet("foo${1:index}") // tslint:disable-line

            const placeholders = oniSnippet.getPlaceholders()

            assert.deepEqual(placeholders[0], {
                index: 1,
                line: 0,
                character: 3,
                value: "index",
            })
        })

        it("gets multiple placeholders on different lines", () => {
            const oniSnippet = new OniSnippet("foo${1:a}\nbar${2:b}") // tslint:disable-line

            const placeholders = oniSnippet.getPlaceholders()

            assert.deepEqual(placeholders[0], {
                index: 1,
                line: 0,
                character: 3,
                value: "a",
            })

            assert.deepEqual(placeholders[1], {
                index: 2,
                line: 1,
                character: 3,
                value: "b",
            })
        })
    })

    describe("setPlaceholder", () => {
        it("replaces placeholder in multiple positions", () => {
            const oniSnippet = new OniSnippet("${1}${1}${1}") // tslint:disable-line

            oniSnippet.setPlaceholder(1, "test")

            assert.deepEqual(oniSnippet.getLines(), ["testtesttest"])

            oniSnippet.setPlaceholder(1, "test2")

            assert.deepEqual(oniSnippet.getLines(), ["test2test2test2"])
        })
    })
})
