import * as assert from "assert"

import * as AutoClosingPairs from "./../../src/Services/AutoClosingPairs"

describe("AutoClosingPairs", () => {
    describe("getWhitespacePrefix", () => {
        it("returns empty if the string doesn't have whitespace", () => {
            const result = AutoClosingPairs.getWhiteSpacePrefix("test")
            assert.strictEqual(result, "")
        })

        it("returns tab", () => {
            const result = AutoClosingPairs.getWhiteSpacePrefix("\ttest")
            assert.strictEqual(result, "\t")
        })

        it("returns spaces", () => {
            const result = AutoClosingPairs.getWhiteSpacePrefix("  test")
            assert.strictEqual(result, "  ")
        })
    })
})
