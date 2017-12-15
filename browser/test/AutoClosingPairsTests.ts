
import test from "ava"

import * as AutoClosingPairs from "../src/Services/AutoClosingPairs"

test("AutoClosingPairs.getWhitespacePrefix() returns empty if the string doesn't have whitespace", t => {
    const result = AutoClosingPairs.getWhiteSpacePrefix("test")
    t.is(result, "")
})

test("AutoClosingPairs.getWhitespacePrefix() returns tab", t => {
    const result = AutoClosingPairs.getWhiteSpacePrefix("\ttest")
    t.is(result, "\t")
})

test("AutoClosingPairs.getWhiteSpacePrefix() returns spaces", t => {
    const result = AutoClosingPairs.getWhiteSpacePrefix("  test")
    t.is(result, "  ")
})

