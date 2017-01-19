import * as assert from "assert"

import { evaluateBlock, getCommonImports } from "../src/LiveEvaluation"

describe("LiveEvaluation Test", () => {

    const testId = "id1"
    const testFileName = "testFileName"

    describe("evaluateBlock", () => {
        it("has result for compilation error", () => {
            const erroneousCodeBlock = "this code should have a compilation error"

            return evaluateBlock(testId, testFileName, erroneousCodeBlock)
                    .then((result) => {
                        assert.strictEqual(result.errors.length, 1, "Validate errors array is populated")
                    })
        })
    })

    describe("getCommonImports", () => {

        it("returns line containing import and require", () => {

            const lines = [
                "import * as derp",
                "var test = require('test')",
                "someotherline",
            ]

            const result = getCommonImports(lines)

            assert.deepEqual(result, [lines[0], lines[1]])
        })
    })
})
