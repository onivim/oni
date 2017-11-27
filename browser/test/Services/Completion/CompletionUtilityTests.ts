import * as assert from "assert"

import * as CompletionUtility from "./../../../../src/Services/Language/Completion/CompletionUtility"

describe("CompletionUtility", () => {

    describe("getCompletionStart", () => {
        it("rewinds back to first character", () => {
            const bufferLine = "abc"
            const cursorColumn = 5
            const completion = "c"

            const completionStart = CompletionUtility.getCompletionStart(bufferLine, cursorColumn, completion)
            assert.strictEqual(completionStart, 2)
        })
    })
})
