import * as assert from "assert"

import * as types from "vscode-languageserver-types"

import * as Mocks from "./../../Mocks"

import { SyntaxHighlightReconciler, ISyntaxHighlightState, ISyntaxHighlightLineInfo } from "./../../../src/Services/SyntaxHighlighting"

describe("SyntaxHighlightReconciler", () => {

    let syntaxHighlightReconciler: SyntaxHighlightReconciler
    let mockConfiguration: Mocks.MockConfiguration
    let mockEditor: Mocks.MockEditor
    let mockBuffer: Mocks.MockBuffer

    beforeEach(() => {
        mockConfiguration = new Mocks.MockConfiguration()
        mockEditor = new Mocks.MockEditor()

        syntaxHighlightReconciler = new SyntaxHighlightReconciler(mockConfiguration as any, mockEditor as any)

        mockBuffer = new Mocks.MockBuffer("javascript", "test.js", [])
        mockEditor.simulateBufferEnter(mockBuffer)
    })

    it("updates tokens", () => {

        const tokenInfo = {
            scopes: ["scope.test"],
            range: types.Range.create(0, 0, 0, 5)
        }

        const lineInfo: ISyntaxHighlightLineInfo = {
            line: null,
            ruleStack: null,
            tokens: [tokenInfo],
            dirty: false,
        }


        const testState: ISyntaxHighlightState = {
            isInsertMode: false,
            bufferToHighlights:{
                [mockBuffer.id]: {
                    bufferId: mockBuffer.id,
                    language: mockBuffer.language,
                    extension: null,
                    topVisibleLine: 0,
                    bottomVisibleLine: 100,

                    activeInsertModeLine: -1,
                    lines: { 0: lineInfo }
                }
            }
        }

        syntaxHighlightReconciler.update(testState)

        console.log(mockBuffer.mockHighlights.getHighlightsForLine(1))

        assert.ok(false, "fail")
    })
})
