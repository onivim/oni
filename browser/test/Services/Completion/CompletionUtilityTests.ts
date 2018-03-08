import * as assert from "assert"

import * as types from "vscode-languageserver-types"

import * as CompletionUtility from "./../../../src/Services/Completion/CompletionUtility"
import { EditorManager } from "./../../../src/Services/EditorManager"
import { SnippetManager } from "./../../../src/Services/Snippets"

const DefaultCursorMatchRegEx = /[a-z]/i
const DefaultTriggerCharacters = ["."]

import { MockBuffer, MockConfiguration, MockEditor } from "./../../Mocks"

describe("CompletionUtility", () => {
    describe("commitCompletion", () => {
        let mockConfiguration: MockConfiguration
        let editorManager: EditorManager
        let mockEditor: MockEditor
        let snippetManager: SnippetManager

        beforeEach(() => {
            editorManager = new EditorManager()
            mockEditor = new MockEditor()
            editorManager.setActiveEditor(mockEditor)
            mockConfiguration = new MockConfiguration({})
            snippetManager = new SnippetManager(mockConfiguration as any, editorManager)
        })

        it("handles basic completion", async () => {
            const mockBuffer = new MockBuffer()
            mockBuffer.setLinesSync(["some comp sentence"])
            mockBuffer.setCursorPosition(0, 9)

            const simpleCompletionItem = types.CompletionItem.create("completion")
            simpleCompletionItem.insertText = "completion"

            await CompletionUtility.commitCompletion(mockBuffer as any, 0, 5, simpleCompletionItem)

            const [resultLine] = await mockBuffer.getLines(0, 1)

            assert.strictEqual(resultLine, "some completion sentence")
        })

        it("inserts a snippet", async () => {
            const mockBuffer = new MockBuffer()
            mockEditor.simulateBufferEnter(mockBuffer)
            mockBuffer.setLinesSync(["some comp sentence"])
            mockBuffer.setCursorPosition(0, 9)

            const snippetCompletionItem = types.CompletionItem.create("completion_snippet")
            snippetCompletionItem.insertText = "${0:foo} ${1:bar}" // tslint:disable-line
            snippetCompletionItem.insertTextFormat = types.InsertTextFormat.Snippet

            await CompletionUtility.commitCompletion(
                mockBuffer as any,
                0,
                5,
                snippetCompletionItem,
                snippetManager,
            )

            const [resultLine] = await mockBuffer.getLines(0, 1)
            assert.strictEqual(resultLine, "some foo bar sentence")
        })
    })

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
