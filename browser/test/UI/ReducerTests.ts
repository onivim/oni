import * as assert from "assert"

import { fuzzyMatchCharacters } from "./../../src/UI/Reducer"

describe("Reducer", () => {
    describe("fuzzyMatchCharacters", () => {
        it("matches single item", () => {
            const val = fuzzyMatchCharacters(["a"], ["a"])
            assert.deepEqual(val.highlightIndices, [0])
            assert.deepEqual(val.remainingCharacters, [])
        })

        it("does not match if no characters match", () => {
            const val = fuzzyMatchCharacters(["a", "b", "c"], ["d"])
            assert.deepEqual(val.highlightIndices, [])
            assert.deepEqual(val.remainingCharacters, ["d"])
        })

        it("matches multiple items", () => {
            const val = fuzzyMatchCharacters(["a", "b", "a"], ["a", "b"])
            assert.deepEqual(val.highlightIndices, [0, 1])
            assert.deepEqual(val.remainingCharacters, [])
        })
    })
})
