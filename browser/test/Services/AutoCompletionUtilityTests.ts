import * as assert from "assert"

import * as AutoCompletionUtility from "./../../src/Services/AutoCompletionUtility"

describe("AutoCompletionUtility", () => {

    describe("replacePrefixWithCompletion", () => {
        it("replaces with completion", () => {
            const line = "window.setTim"
            const cursorColumn = 12
            const completion = "setTimeout"

            const newLine = AutoCompletionUtility.replacePrefixWithCompletion(line, cursorColumn, completion)
            assert.strictEqual(newLine, "window.setTimeout")
        })

        it("replaces with completion at beginning of line", () => {
            const line = "wi"
            const cursorColumn = 2
            const completion = "window"

            const newLine = AutoCompletionUtility.replacePrefixWithCompletion(line, cursorColumn, completion)
            assert.strictEqual(newLine, "window")
        })

        it("replaces with completion where none of the items match", () => {
            const line = "window."
            const cursorColumn = 8
            const completion = "Blob"

            const newLine = AutoCompletionUtility.replacePrefixWithCompletion(line, cursorColumn, completion)
            assert.strictEqual(newLine, "window.Blob")
        })
    })

    describe("getCompletionStart", () => {
        it("rewinds back to first character", () => {
            const bufferLine = "abc"
            const cursorColumn = 5
            const completion = "c"

            const completionStart = AutoCompletionUtility.getCompletionStart(bufferLine, cursorColumn, completion)
            assert.strictEqual(completionStart, 2)
        })
    })
})
