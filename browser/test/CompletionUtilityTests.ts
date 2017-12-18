
import test from "ava"

import * as CompletionUtility from "../src/Services/Completion/CompletionUtility"

const DefaultCursorMatchRegEx = /[a-z]/i
const DefaultTriggerCharacters = ["."]

test("CompletionUtility.getCompletionStart() rewinds back to first character", t => {
    const bufferLine = "abc"
    const cursorColumn = 5
    const completion = "c"

    const completionStart = CompletionUtility.getCompletionStart(bufferLine, cursorColumn, completion)
    t.is(completionStart, 2)
})

test("CompletionUtility.getCompletionMeet().shouldExpandCompletions is true when at end of word", t => {

    const line = "const"
    const cursorPosition = 5 // const|

    const meet = CompletionUtility.getCompletionMeet(line, cursorPosition, DefaultCursorMatchRegEx, DefaultTriggerCharacters)

    const expectedResult = {
        position: 0,
        positionToQuery: 1, // When there is no trigger character, we expect it to be an extra position forward
        base: "const",
        shouldExpandCompletions: true,
    }

    t.deepEqual(meet, expectedResult)
})

test("CompletionUtility.getCompletionMeet().shouldExpandCompletions is false when in the middle of a word", t => {
    const line = "const"
    const cursorPosition = 3 // con|st

    const meet = CompletionUtility.getCompletionMeet(line, cursorPosition, DefaultCursorMatchRegEx, DefaultTriggerCharacters)

    const expectedResult = {
        position: 0,
        positionToQuery: 1, // When there is no trigger character, we expect it to be an extra position forward
        base: "con",
        shouldExpandCompletions: false,
    }

    t.deepEqual(meet, expectedResult)
})
