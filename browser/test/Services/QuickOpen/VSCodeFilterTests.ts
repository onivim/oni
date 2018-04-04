/**
 * VSCodeFilterTests.ts
 */

import * as assert from "assert"
import { processSearchTerm, vsCodeFilter } from "./../../../src/Services/QuickOpen/VSCodeFilter"

describe("processSearchTerm", () => {
    it("Correctly matches word.", async () => {
        const testString = "src"
        const testList = [
            { label: "index.ts", detail: "browser/src/index.ts" },
            { label: "index.ts", detail: "browser/test/index.ts" },
        ]

        const result = processSearchTerm(testString, testList)
        const filteredResult = result.filter(r => r.score !== 0)

        // Remove the score since it can change if we updated the
        // module. As long as its not 0 that is enough here.
        assert.equal(result[0].score > 0, true)
        delete result[0].score

        const expectedResult = [
            {
                label: "index.ts",
                labelHighlights: [] as number[],
                detail: "browser/src/index.ts",
                detailHighlights: [8, 9, 10],
            },
        ]

        assert.deepEqual(filteredResult, expectedResult)
    })
    it("Correctly score case-match higher", async () => {
        const testString = "SRC"
        const testList = [
            { label: "index.ts", detail: "browser/src/index.ts" },
            { label: "index.ts", detail: "browser/SRC/index.ts" },
        ]

        const result = processSearchTerm(testString, testList)

        // Check the exact case match scores higher
        const lowercase = result.find(r => r.detail === "browser/src/index.ts")
        const uppercase = result.find(r => r.detail === "browser/SRC/index.ts")
        assert.equal(uppercase.score > lowercase.score, true)

        // Both should be highlighted though
        assert.deepEqual(uppercase.detailHighlights, [8, 9, 10])
        assert.deepEqual(lowercase.detailHighlights, [8, 9, 10])
    })
    it("Correctly returns no matches.", async () => {
        const testString = "zzz"
        const testList = [
            { label: "index.ts", detail: "browser/src/index.ts" },
            { label: "index.ts", detail: "browser/test/index.ts" },
        ]

        const result = processSearchTerm(testString, testList)
        const filteredResult = result.filter(r => r.score !== 0)

        assert.deepEqual(filteredResult, [])
    })
})

describe("vsCodeFilter", () => {
    it("Correctly matches string.", async () => {
        const testString = "index"
        const testList = [
            { label: "index.ts", detail: "browser/src/index.ts" },
            { label: "main.ts", detail: "browser/src/main.ts" },
            { label: "index.ts", detail: "browser/test/index.ts" },
        ]

        const result = vsCodeFilter(testList, testString)

        // Remove the score since it can change if we updated the
        // module.
        // However, the score should be equal due to an exact match on both.
        assert.equal(result[0].score === result[1].score, true)
        delete result[0].score
        delete result[1].score

        const expectedResult = [
            {
                label: "index.ts",
                labelHighlights: [0, 1, 2, 3, 4],
                detail: "browser/src/index.ts",
                detailHighlights: [] as number[],
            },
            {
                label: "index.ts",
                labelHighlights: [0, 1, 2, 3, 4],
                detail: "browser/test/index.ts",
                detailHighlights: [] as number[],
            },
        ]

        assert.deepEqual(result, expectedResult)
    })
    it("Correctly splits and matches string.", async () => {
        const testString = "index src"
        const testList = [
            { label: "index.ts", detail: "browser/src/index.ts" },
            { label: "index.ts", detail: "browser/test/index.ts" },
        ]

        const result = vsCodeFilter(testList, testString)

        // Remove the score since it can change if we updated the
        // module. As long as its not 0 that is enough here.
        assert.equal(result[0].score > 0, true)
        delete result[0].score

        const expectedResult = [
            {
                label: "index.ts",
                labelHighlights: [0, 1, 2, 3, 4],
                detail: "browser/src/index.ts",
                detailHighlights: [8, 9, 10],
            },
        ]

        assert.deepEqual(result, expectedResult)
    })
    it("Correctly matches long split string.", async () => {
        const testString = "index src service quickopen"
        const testList = [
            { label: "index.ts", detail: "browser/src/services/menu/index.ts" },
            { label: "index.ts", detail: "browser/src/services/quickopen/index.ts" },
        ]

        const result = vsCodeFilter(testList, testString)

        // Remove the score since it can change if we updated the
        // module. As long as its not 0 that is enough here.
        // Similarly, the highlights has been tested elsewhere,
        // and its long here, so just check lengths.
        assert.equal(result[0].score > 0, true)
        assert.equal(result[0].labelHighlights.length === 5, true)
        assert.equal(result[0].detailHighlights.length === 19, true)
        delete result[0].score
        delete result[0].labelHighlights
        delete result[0].detailHighlights

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

        const result = vsCodeFilter(testList, testString)

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
        const result = vsCodeFilter(testList, testString)

        assert.deepEqual(result, [])
    })
})
