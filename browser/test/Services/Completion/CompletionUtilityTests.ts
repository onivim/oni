import * as assert from "assert"

import * as CompletionUtility from "./../../../src/Services/Completion/CompletionUtility"

const DefaultCursorMatchRegEx = /[a-z]/i
const DefaultTriggerCharacters = ["."]

describe("CompletionUtility", () => {
    describe("getCompletionStart", () => {
        it("rewinds back to first character", () => {
            const bufferLine = "abc"
            const cursorColumn = 5
            const completion = "c"

            const completionStart = CompletionUtility.getCompletionStart(
                bufferLine,
                cursorColumn,
                completion,
            )
            assert.strictEqual(completionStart, 2)
        })
    })

    describe("getCompletionMeet", () => {
        it("shouldExpandCompletions is true when at end of word", () => {
            const line = "const"
            const cursorPosition = 5 // const|

            const meet = CompletionUtility.getCompletionMeet(
                line,
                cursorPosition,
                DefaultCursorMatchRegEx,
                DefaultTriggerCharacters,
            )

            const expectedResult = {
                position: 0,
                positionToQuery: 1, // When there is no trigger character, we expect it to be an extra position forward
                base: "const",
                shouldExpandCompletions: true,
            }

            assert.deepEqual(meet, expectedResult)
        })

        it("shouldExpandCompletions is false when in the middle of a word", () => {
            const line = "const"
            const cursorPosition = 3 // con|st

            const meet = CompletionUtility.getCompletionMeet(
                line,
                cursorPosition,
                DefaultCursorMatchRegEx,
                DefaultTriggerCharacters,
            )

            const expectedResult = {
                position: 0,
                positionToQuery: 1, // When there is no trigger character, we expect it to be an extra position forward
                base: "con",
                shouldExpandCompletions: false,
            }

            assert.deepEqual(meet, expectedResult)
        })
    })
})
