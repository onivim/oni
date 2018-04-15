/**
 * VSCodeFilterTests.ts
 */

import * as assert from "assert"
import { processSearchTerm, vsCodeFilter } from "./../../../src/Services/QuickOpen/VSCodeFilter"

describe("processSearchTerm", () => {
    it("Correctly matches word.", async () => {
        const testString = "src"
        const testList = [
            { label: "index.ts", detail: "browser/src" },
            { label: "index.ts", detail: "browser/test" },
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
                detail: "browser/src",
                detailHighlights: [8, 9, 10],
            },
        ]

        assert.deepEqual(filteredResult, expectedResult)
    })
    it("Correctly score case-match higher", async () => {
        const testString = "SRC"
        const testList = [
            { label: "index.ts", detail: "browser/src" },
            { label: "index.ts", detail: "browser/SRC" },
        ]

        const result = processSearchTerm(testString, testList)

        // Check the exact case match scores higher
        const lowercase = result.find(r => r.detail === "browser/src")
        const uppercase = result.find(r => r.detail === "browser/SRC")
        assert.equal(uppercase.score > lowercase.score, true)

        // Both should be highlighted though
        assert.deepEqual(uppercase.detailHighlights, [8, 9, 10])
        assert.deepEqual(lowercase.detailHighlights, [8, 9, 10])
    })
    it("Correctly returns no matches.", async () => {
        const testString = "zzz"
        const testList = [
            { label: "index.ts", detail: "browser/src" },
            { label: "index.ts", detail: "browser/test" },
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
            { label: "index.ts", detail: "browser/src" },
            { label: "main.ts", detail: "browser/src" },
            { label: "index.ts", detail: "browser/test" },
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
                detail: "browser/src",
                detailHighlights: [] as number[],
            },
            {
                label: "index.ts",
                labelHighlights: [0, 1, 2, 3, 4],
                detail: "browser/test",
                detailHighlights: [] as number[],
            },
        ]

        assert.deepEqual(result, expectedResult)
    })
    it("Correctly matches string with extension.", async () => {
        const testString = "index.ts"
        const testList = [
            { label: "index.ts", detail: "browser/src" },
            { label: "main.ts", detail: "browser/src" },
            { label: "index.ts", detail: "browser/test" },
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
                labelHighlights: [0, 1, 2, 3, 4, 5, 6, 7],
                detail: "browser/src",
                detailHighlights: [] as number[],
            },
            {
                label: "index.ts",
                labelHighlights: [0, 1, 2, 3, 4, 5, 6, 7],
                detail: "browser/test",
                detailHighlights: [] as number[],
            },
        ]

        assert.deepEqual(result, expectedResult)
    })
    it("Correctly splits and matches string.", async () => {
        const testString = "index src"
        const testList = [
            { label: "index.ts", detail: "browser/src" },
            { label: "index.ts", detail: "browser/test" },
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
                detail: "browser/src",
                detailHighlights: [8, 9, 10],
            },
        ]

        assert.deepEqual(result, expectedResult)
    })
    it("Correctly matches long split string.", async () => {
        const testString = "index src service quickopen"
        const testList = [
            { label: "index.ts", detail: "browser/src/services/menu" },
            { label: "index.ts", detail: "browser/src/services/quickopen" },
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

        const expectedResult = [{ label: "index.ts", detail: "browser/src/services/quickopen" }]

        assert.deepEqual(result, expectedResult)
    })
    it("Correctly doesn't match.", async () => {
        const testString = "zzz"
        const testList = [
            { label: "index.ts", detail: "browser/src/services/menu" },
            { label: "index.ts", detail: "browser/src/services/quickopen" },
        ]

        const result = vsCodeFilter(testList, testString)

        assert.deepEqual(result, [])
    })
    it("Correctly matches split string in turn.", async () => {
        const testString = "index main"
        const testList = [
            { label: "index.ts", detail: "browser/src/services/config" },
            { label: "index.ts", detail: "browser/src/services/quickopen" },
            { label: "main.ts", detail: "browser/src/services/menu" },
        ]

        // Should return no results, since the first term should restrict the second
        // search to return no results.
        const result = vsCodeFilter(testList, testString)

        assert.deepEqual(result, [])
    })
    it("Correctly sorts results for fuzzy match.", async () => {
        const testString = "aBE"
        const testList = [
            { label: "BufferEditor.ts", detail: "packages/demo/src" },
            { label: "BufferEditorContainer.ts", detail: "packages/demo/src" },
            { label: "astBackedEditing.ts", detail: "packages/core/src" },
        ]

        // All results match, but only the last has an exact match on aBE inside the file name.
        const result = vsCodeFilter(testList, testString)

        const be = result.find(r => r.label === "BufferEditor.ts")
        const bec = result.find(r => r.label === "BufferEditorContainer.ts")
        const abe = result.find(r => r.label === "astBackedEditing.ts")

        // Therefore it should score the highest.
        assert.equal(abe.score > be.score, true)
        assert.equal(abe.score > bec.score, true)

        // It should also be the first in the list
        assert.deepEqual(result[0], abe)
    })
    it("Correctly sorts results for filtered search.", async () => {
        const testString = "buffer test oni"
        const testList = [
            { label: "BufferEditor.ts", detail: "packages/demo/src" },
            { label: "BufferEditorContainer.ts", detail: "packages/demo/src" },
            { label: "BufferEditor.ts", detail: "packages/core/src" },
            { label: "BufferEditor.ts", detail: "packages/core/test" },
            { label: "BufferEditor.ts", detail: "packages/core/test/oni" },
        ]

        const result = vsCodeFilter(testList, testString)

        // Should only match the last term
        const best = result.find(r => r.detail === "packages/core/test/oni")
        assert.deepEqual(result[0], best)
        assert.equal(result.length, 1)
    })
    it("Correctly sorts results for shortest result on file name.", async () => {
        const testString = "main"
        const testList = [
            { label: "main.tex", detail: "packages/core/src" },
            { label: "main.tex", detail: "packages/core/test" },
            { label: "main.tex", detail: "packages/core/test/oni" },
        ]

        const result = vsCodeFilter(testList, testString)

        // Should prefer the short path
        const best = result.find(r => r.detail === "packages/core/src")
        const second = result.find(r => r.detail === "packages/core/test")
        const third = result.find(r => r.detail === "packages/core/test/oni")

        // Order should be as follows
        assert.deepEqual(result[0], best)
        assert.deepEqual(result[1], second)
        assert.deepEqual(result[2], third)
    })
    it("Correctly sorts results for shortest result on path.", async () => {
        const testString = "somepath"
        const testList = [
            { label: "fileA.ts", detail: "/some/path" },
            { label: "fileB.ts", detail: "/some/path/longer" },
            { label: "fileC.ts", detail: "packages/core/oni" },
        ]

        const result = vsCodeFilter(testList, testString)

        // Should prefer the short path
        const best = result.find(r => r.label === "fileA.ts")
        const second = result.find(r => r.label === "fileB.ts")

        // Order should be as follows
        assert.deepEqual(result[0], best)
        assert.deepEqual(result[1], second)
    })
})
