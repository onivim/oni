import * as assert from "assert"

import * as types from "vscode-languageserver-types"

import * as Mocks from "./../Mocks"

import * as AutoClosingPairs from "./../../src/Services/AutoClosingPairs"
import { IAutoClosingPair } from "./../../src/Services/AutoClosingPairs"

describe("AutoClosingPairs", () => {
    describe("getWhitespacePrefix", () => {
        it("returns empty if the string doesn't have whitespace", () => {
            const result = AutoClosingPairs.getWhiteSpacePrefix("test")
            assert.strictEqual(result, "")
        })

        it("returns tab", () => {
            const result = AutoClosingPairs.getWhiteSpacePrefix("\ttest")
            assert.strictEqual(result, "\t")
        })

        it("returns spaces", () => {
            const result = AutoClosingPairs.getWhiteSpacePrefix("  test")
            assert.strictEqual(result, "  ")
        })
    })

    describe("handleOpenCharacter", () => {
        let mockEditor: Mocks.MockEditor
        let mockBuffer: Mocks.MockBuffer

        beforeEach(() => {
            mockEditor = new Mocks.MockEditor()
            mockBuffer = new Mocks.MockBuffer("typescript", "test.ts", [""])
            mockEditor.simulateBufferEnter(mockBuffer)
        })

        it("inserts both characters of the pair", async () => {
            const pair = { open: "(", close: ")" } as IAutoClosingPair

            mockBuffer.setLinesSync(["("])
            AutoClosingPairs.checkOpenCharacter(
                (str: string) => {
                    mockBuffer.setLinesSync([str])
                },
                pair,
                mockEditor as any,
                false,
            )

            const [firstLine] = await mockBuffer.getLines(0, 1)

            assert.strictEqual(firstLine, "()")
        })

        it("doesn't duplicate quote on close", async () => {
            const pair = { open: '"', close: '"' } as IAutoClosingPair

            mockBuffer.setLinesSync(['"Oni"'])
            mockBuffer.setCursorPosition(types.Position.create(0, 4))
            AutoClosingPairs.checkOpenCharacter(
                (str: string) => {
                    mockBuffer.setLinesSync([str])
                },
                pair,
                mockEditor as any,
                true,
            )

            const [firstLine] = await mockBuffer.getLines(0, 1)

            assert.strictEqual(firstLine, '"Oni"')
        })

        it("moves the cursor correctly onto the closing quote", async () => {
            const pair = { open: '"', close: '"' } as IAutoClosingPair

            mockBuffer.setLinesSync(['"Oni"'])
            mockBuffer.setCursorPosition(types.Position.create(0, 4))
            AutoClosingPairs.checkOpenCharacter(
                (str: string) => {
                    mockBuffer.setLinesSync([str])
                },
                pair,
                mockEditor as any,
                true,
            )

            const endCursorPos = await mockBuffer.getCursorPosition()

            assert.strictEqual(endCursorPos, types.Position.create(0, 5))
        })
    })
})
