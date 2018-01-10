import * as assert from "assert"

import *as types from "vscode-languageserver-types"

import * as Snippets from "./../../src/Services/Snippets"

describe("Snippets", () => {
    describe("remapRanges", () => {
        it("updates ranges that are after, but leaves ranges not after unchanged", () => {

            const ranges = [
                types.Range.create(0, 0, 0, 2),
                types.Range.create(0, 10, 0, 12),
            ]

            const range = types.Range.create(0, 5, 0, 7)

            const remappedRanges = Snippets.remapRanges(range, -2, ranges)

            const expectedResult =[
                types.Range.create(0, 0, 0, 2),
                types.Range.create(0, 8, 0, 10),
            ]

            assert.deepEqual(remappedRanges, expectedResult)
        })
    })
})
