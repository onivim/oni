import * as assert from "assert"

import * as types from "vscode-languageserver-types"

import * as Mocks from "./../../Mocks"

import { HighlightInfo, ISyntaxHighlightLineInfo, ISyntaxHighlightState, SyntaxHighlightReconciler } from "./../../../src/Services/SyntaxHighlighting"

describe("SyntaxHighlightReconciler", () => {

    let syntaxHighlightReconciler: SyntaxHighlightReconciler
    let mockConfiguration: Mocks.MockConfiguration
    let mockEditor: Mocks.MockEditor
    let mockBuffer: Mocks.MockBuffer

    beforeEach(() => {
        mockConfiguration = new Mocks.MockConfiguration()
        mockEditor = new Mocks.MockEditor()

        mockConfiguration.setValue("editor.tokenColors", [{
            scope: "scope.test",
            settings: "Identifier",
        }])

        syntaxHighlightReconciler = new SyntaxHighlightReconciler(mockConfiguration as any, mockEditor as any)

        mockBuffer = new Mocks.MockBuffer("javascript", "test.js", [])
        mockEditor.simulateBufferEnter(mockBuffer)
    })

    const createHighlightState = (lineNumber: number, line: string, tokenInfo: any[]) => {
        const lineInfo: ISyntaxHighlightLineInfo = {
            line,
            ruleStack: null,
            tokens: tokenInfo,
            dirty: false,
        }

        const lines = {
            [lineNumber]: lineInfo,
        }

        const testState: ISyntaxHighlightState = {
            isInsertMode: false,
            bufferToHighlights: {
                [mockBuffer.id]: {
                    bufferId: mockBuffer.id,
                    language: mockBuffer.language,
                    extension: null,
                    topVisibleLine: 0,
                    bottomVisibleLine: 100,
                    activeInsertModeLine: -1,
                    lines,
                },
            },
        }

        return testState
    }

    it("sets tokens", () => {

        const tokenInfo = {
            scopes: ["scope.test"],
            range: types.Range.create(0, 0, 0, 5),
        }

        const testState = createHighlightState(0, null, [tokenInfo])

        syntaxHighlightReconciler.update(testState)

        const highlights = mockBuffer.mockHighlights.getHighlightsForLine(0)

        const expectedHighlights: HighlightInfo[] = [{
                highlightGroup: "Identifier",
                range: types.Range.create(0, 0, 0, 5),
            }]

        assert.deepEqual(highlights, expectedHighlights, "Validate highlightsAfterClearing are correct")
    })

    it("clears tokens", () => {

        const tokenInfo = {
            scopes: ["scope.test"],
            range: types.Range.create(0, 0, 0, 5),
        }

        const testState = createHighlightState(0, null, [tokenInfo])

        syntaxHighlightReconciler.update(testState)

        // Now, clear the tokens out, and update again
        const newState = createHighlightState(0, "// new state", [])
        syntaxHighlightReconciler.update(newState)

        const highlightsAfterClearing = mockBuffer.mockHighlights.getHighlightsForLine(0)
        const expectedHighlights: HighlightInfo[] = []
        assert.deepEqual(highlightsAfterClearing, expectedHighlights, "Validate highlightsAfterClearing are cleared")
    })
})
