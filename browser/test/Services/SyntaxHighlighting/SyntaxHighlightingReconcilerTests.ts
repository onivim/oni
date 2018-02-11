import * as assert from "assert"

import * as types from "vscode-languageserver-types"

import * as Mocks from "./../../Mocks"

import {
    HighlightInfo,
    ISyntaxHighlightLineInfo,
    ISyntaxHighlightState,
    SyntaxHighlightReconciler,
} from "./../../../src/Services/SyntaxHighlighting"

const COLOR_BLACK = "#000000"
const COLOR_WHITE = "#FFFFFF"

describe("SyntaxHighlightReconciler", () => {
    let syntaxHighlightReconciler: SyntaxHighlightReconciler
    let mockTokenColors: Mocks.MockTokenColors
    let mockEditor: Mocks.MockEditor
    let mockBuffer: Mocks.MockBuffer

    beforeEach(() => {
        mockEditor = new Mocks.MockEditor()

        mockTokenColors = new Mocks.MockTokenColors([
            {
                scope: "scope.test",
                settings: {
                    backgroundColor: COLOR_BLACK,
                    foregroundColor: COLOR_WHITE,
                    bold: true,
                    italic: true,
                },
            },
        ])

        syntaxHighlightReconciler = new SyntaxHighlightReconciler(
            mockEditor as any,
            mockTokenColors as any,
        )

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

        const expectedHighlights: HighlightInfo[] = [
            {
                range: types.Range.create(0, 0, 0, 5),
                tokenColor: {
                    scope: "scope.test",
                    settings: {
                        backgroundColor: COLOR_BLACK,
                        foregroundColor: COLOR_WHITE,
                        italic: true,
                        bold: true,
                    },
                },
            },
        ]

        assert.deepEqual(
            highlights,
            expectedHighlights,
            "Validate highlightsAfterClearing are correct",
        )
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
        assert.deepEqual(
            highlightsAfterClearing,
            expectedHighlights,
            "Validate highlightsAfterClearing are cleared",
        )
    })
})
