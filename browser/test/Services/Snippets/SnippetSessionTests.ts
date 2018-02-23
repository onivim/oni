/**
 * SnippetSessionTests.ts
 */

import * as assert from "assert"
import * as types from "vscode-languageserver-types"

import { OniSnippet } from "./../../../src/Services/Snippets/OniSnippet"
import { SnippetSession } from "./../../../src/Services/Snippets/SnippetSession"

import * as Mocks from "./../../Mocks"

// tslint:disable no-invalid-template-strings

describe("SnippetSession", () => {
    let mockEditor: Mocks.MockEditor
    let mockBuffer: Mocks.MockBuffer
    let snippetSession: SnippetSession

    beforeEach(() => {
        mockEditor = new Mocks.MockEditor()
        mockBuffer = new Mocks.MockBuffer("typescript", "index.ts", [""])
        mockEditor.simulateBufferEnter(mockBuffer)
    })

    it("inserts into empty line", async () => {
        const snippet = new OniSnippet("foo")
        snippetSession = new SnippetSession(mockEditor as any, snippet)

        await snippetSession.start()

        const [firstLine] = await mockBuffer.getLines(0, 1)

        assert.strictEqual(firstLine, "foo")
    })

    it("inserts between characters", async () => {
        const snippet = new OniSnippet("foo")
        snippetSession = new SnippetSession(mockEditor as any, snippet)

        // Add a line, and move cursor to line
        mockBuffer.setLinesSync(["someline"])
        mockBuffer.setCursorPosition(0, 4)

        await snippetSession.start()

        const [firstLine] = await mockBuffer.getLines(0, 1)

        assert.strictEqual(firstLine, "somefooline")
    })

    it("handles multiple lines", async () => {
        const snippet = new OniSnippet("foo\nbar")
        snippetSession = new SnippetSession(mockEditor as any, snippet)

        // Add a line, and move cursor to line
        mockBuffer.setLinesSync(["someline"])
        mockBuffer.setCursorPosition(0, 4)

        await snippetSession.start()

        const [firstLine, secondLine] = await mockBuffer.getLines(0, 2)

        assert.strictEqual(firstLine, "somefoo")
        assert.strictEqual(secondLine, "barline")
    })

    it("highlights first placeholder", async () => {
        const snippet = new OniSnippet("${0:test}")
        snippetSession = new SnippetSession(mockEditor as any, snippet)

        mockBuffer.setLinesSync(["abc"])
        mockBuffer.setCursorPosition(0, 1)

        await snippetSession.start()

        const selection = await mockEditor.getSelection()

        const expectedRange = types.Range.create(0, 1, 0, 4)
        assert.strictEqual(selection.start.line, expectedRange.start.line)
        assert.strictEqual(selection.start.character, expectedRange.start.character)
        assert.strictEqual(selection.end.character, expectedRange.end.character)
    })

    describe("next placeholder", () => {
        it("highlights correct placeholder after calling nextPlaceholder", async () => {
            const snippet = new OniSnippet("${0:test} ${1:test2}")
            snippetSession = new SnippetSession(mockEditor as any, snippet)

            await snippetSession.start()

            await snippetSession.nextPlaceholder()

            const selection = await mockEditor.getSelection()

            const expectedRange = types.Range.create(0, 5, 0, 9)
            assert.strictEqual(selection.start.line, expectedRange.start.line)
            assert.strictEqual(selection.start.character, expectedRange.start.character)
            assert.strictEqual(selection.end.character, expectedRange.end.character)
        })

        it("traverses order correctly, when placeholders are reversed", async () => {
            const snippet = new OniSnippet("${1:test} ${0:test2}")
            snippetSession = new SnippetSession(mockEditor as any, snippet)

            await snippetSession.start()

            let selection = await mockEditor.getSelection()

            // Validate we are highlighting the _second_ item now
            const expectedRange = types.Range.create(0, 5, 0, 9)
            assert.strictEqual(selection.start.line, expectedRange.start.line)
            assert.strictEqual(selection.start.character, expectedRange.start.character)
            assert.strictEqual(selection.end.character, expectedRange.end.character)

            await snippetSession.nextPlaceholder()
            selection = await mockEditor.getSelection()

            // Validate we are highlighting the _second_ item now
            const secondItemRange = types.Range.create(0, 1, 0, 4)
            assert.strictEqual(selection.start.line, secondItemRange.start.line)
            assert.strictEqual(selection.start.character, secondItemRange.start.character)
            assert.strictEqual(selection.end.character, secondItemRange.end.character)
        })

        it("traverses order correctly, when there are multiple placeholders with the same index", async () => {
            const snippet = new OniSnippet("${1:test} ${0:test2} ${1}")
            snippetSession = new SnippetSession(mockEditor as any, snippet)

            const placeholder0Range = types.Range.create(0, 5, 0, 9)
            const placeholder1Range = types.Range.create(0, 1, 0, 4)

            await snippetSession.start() // Placeholder 0
            await snippetSession.nextPlaceholder() // Placeholder 1

            let selection = await mockEditor.getSelection()

            assert.strictEqual(selection.start.line, placeholder1Range.start.line)
            assert.strictEqual(selection.start.character, placeholder1Range.start.character)
            assert.strictEqual(selection.end.character, placeholder1Range.end.character)

            await snippetSession.nextPlaceholder() // Wrap back to placeholder 0
            selection = await mockEditor.getSelection()

            // Validate we are highlighting the _second_ item now
            assert.strictEqual(selection.start.line, placeholder0Range.start.line)
            assert.strictEqual(selection.start.character, placeholder0Range.start.character)
            assert.strictEqual(selection.end.character, placeholder0Range.end.character)
        })
    })

    describe("synchronizeUpdatedPlaceholders", () => {
        it("updates placeholders", async () => {
            const snippet = new OniSnippet("${1:test} ${1} ${1}")
            snippetSession = new SnippetSession(mockEditor as any, snippet)
            await snippetSession.start()

            // Validate
            const [currentLine] = await mockBuffer.getLines(0, 1)
            assert.strictEqual(currentLine, "test test test")

            // Simulate typing in first entry
            await mockEditor.setActiveBufferLine(0, "test3 test test")

            await snippetSession.synchronizeUpdatedPlaceholders()

            const [synchronizedLine] = await mockBuffer.getLines(0, 1)
            assert.strictEqual(synchronizedLine, "test3 test3 test3")
        })
    })
})
