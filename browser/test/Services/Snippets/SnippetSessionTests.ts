/**
 * SnippetSessionTests.ts
 */

import * as assert from "assert"

import * as types from "vscode-languageserver-types"

import { OniSnippet } from "./../../../src/Services/Snippets/OniSnippet"
import { SnippetSession } from "./../../../src/Services/Snippets/SnippetSession"

import * as Mocks from "./../../Mocks"

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
        mockBuffer.setCursorPosition(types.Position.create(0, 4))

        await snippetSession.start()

        const [firstLine] = await mockBuffer.getLines(0, 1)

        assert.strictEqual(firstLine, "somefooline")
    })

    it("handles multiple lines", async () => {
        const snippet = new OniSnippet("foo\nbar")
        snippetSession = new SnippetSession(mockEditor as any, snippet)

        // Add a line, and move cursor to line
        mockBuffer.setLinesSync(["someline"])
        mockBuffer.setCursorPosition(types.Position.create(0, 4))

        await snippetSession.start()

        const [firstLine, secondLine] = await mockBuffer.getLines(0, 2)

        assert.strictEqual(firstLine, "somefoo")
        assert.strictEqual(secondLine, "barline")
    })
})

