import * as assert from "assert"

import * as CompletionUtility from "./../../../src/Services/Completion/CompletionUtility"

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

    describe("getCompletionMeet", () => {
        it("shouldExpandCompletions is true when at end of word", () => {
            assert.ok(false)
        })

        it("shouldExpandCompletions is false when in the middle of a word", () => {
            assert.ok(false)
        })
    })
})
