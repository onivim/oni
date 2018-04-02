/**
 * RegExFilterTests.ts
 */

import * as assert from "assert"
// import { createLetterCountDictionary } from "../../../src/UI/components/HighlightText"
import {
    // getHighlightsFromString,
    processSearchTerm,
    regexFilter,
} from "./../../../src/Services/QuickOpen/RegExFilter"

describe("processSearchTerm", () => {
    it("Correctly matches word.", async () => {
        const testString = "src"
        const testList = [
            { label: "index.ts", detail: "browser/src/index.ts" },
            { label: "index.ts", detail: "browser/test/index.ts" },
        ]

        const result = processSearchTerm(testString, testList, false)

        const expectedResult = [{ label: "index.ts", detail: "browser/src/index.ts" }]

        assert.deepEqual(result, expectedResult)
    })
    it("Correctly matches case-sensitive word.", async () => {
        const testString = "SRC"
        const testList = [
            { label: "index.ts", detail: "browser/src/index.ts" },
            { label: "index.ts", detail: "browser/SRC/index.ts" },
        ]

        const result = processSearchTerm(testString, testList, true)

        const expectedResult = [{ label: "index.ts", detail: "browser/SRC/index.ts" }]

        assert.deepEqual(result, expectedResult)
    })
    it("Correctly returns no matches.", async () => {
        const testString = "zzz"
        const testList = [
            { label: "index.ts", detail: "browser/src/index.ts" },
            { label: "index.ts", detail: "browser/test/index.ts" },
        ]

        const result = processSearchTerm(testString, testList, false)

        assert.deepEqual(result, [])
    })
})

describe("regexFilter", () => {
    it("Correctly matches string.", async () => {
        const testString = "index"
        const testList = [
            { label: "index.ts", detail: "browser/src/index.ts" },
            { label: "main.ts", detail: "browser/src/main.ts" },
            { label: "index.ts", detail: "browser/test/index.ts" },
        ]

        const result = regexFilter(testList, testString)

        // Remove the added highlights since they can be tested
        // elsewhere.
        result.forEach(r => {
            delete r.detailHighlights
            delete r.labelHighlights
            delete r.score
        })

        const expectedResult = [
            { label: "index.ts", detail: "browser/src/index.ts" },
            { label: "index.ts", detail: "browser/test/index.ts" },
        ]

        assert.deepEqual(result, expectedResult)
    })
    it("Correctly splits and matches string.", async () => {
        const testString = "index src"
        const testList = [
            { label: "index.ts", detail: "browser/src/index.ts" },
            { label: "index.ts", detail: "browser/test/index.ts" },
        ]

        const result = regexFilter(testList, testString)

        // Remove the added highlights since they can be tested
        // elsewhere.
        delete result[0].detailHighlights
        delete result[0].labelHighlights
        delete result[0].score

        const expectedResult = [{ label: "index.ts", detail: "browser/src/index.ts" }]

        assert.deepEqual(result, expectedResult)
    })
    it("Correctly matches long split string.", async () => {
        const testString = "index src service quickopen"
        const testList = [
            { label: "index.ts", detail: "browser/src/services/menu/index.ts" },
            { label: "index.ts", detail: "browser/src/services/quickopen/index.ts" },
        ]

        const result = regexFilter(testList, testString)

        // Remove the added highlights since they can be tested
        // elsewhere.
        delete result[0].detailHighlights
        delete result[0].labelHighlights
        delete result[0].score

        const expectedResult = [
            { label: "index.ts", detail: "browser/src/services/quickopen/index.ts" },
        ]

        assert.deepEqual(result, expectedResult)
    })
    it("Correctly doesn't match.", async () => {
        const testString = "zzz"
        const testList = [
            { label: "index.ts", detail: "browser/src/services/menu/index.ts" },
            { label: "index.ts", detail: "browser/src/services/quickopen/index.ts" },
        ]

        const result = regexFilter(testList, testString)

        assert.deepEqual(result, [])
    })
    it("Correctly matches split string in turn.", async () => {
        const testString = "index main"
        const testList = [
            { label: "index.ts", detail: "browser/src/services/config/index.ts" },
            { label: "index.ts", detail: "browser/src/services/quickopen/index.ts" },
            { label: "main.ts", detail: "browser/src/services/menu/main.ts" },
        ]

        // Should return no results, since the first term should restrict the second
        // search to return no results.
        const result = regexFilter(testList, testString)

        assert.deepEqual(result, [])
    })
})

// describe("getHighlightsFromString", () => {
//     it("Correctly highlights a match when case is similar", () => {
//         const match = "foobar"
//         const searchString = "foob"

//         const highlights = getHighlightsFromString(match, createLetterCountDictionary(searchString))

//         assert.deepEqual([0, 1, 2, 3], highlights)
//     })

//     it("Correctly highlights a search match when case is not similar (in case INSENSITIVE mode)", () => {
//         const match = "FooBar"
//         const searchString = "foob"

//         const highlights = getHighlightsFromString(match, createLetterCountDictionary(searchString))

//         assert.deepEqual([0, 1, 2, 3], highlights)
//     })

//     it("Correctly highlights a search match when case is not similar (in case SENSITIVE mode)", () => {
//         const match = "FooBar"
//         const searchString = "foob"

//         const highlights = getHighlightsFromString(
//             match,
//             createLetterCountDictionary(searchString),
//             true,
//         )

//         assert.deepEqual([1, 2], highlights)
//     })
// })
