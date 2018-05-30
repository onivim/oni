/**
 * IndentationTests.ts
 */

import * as assert from "assert"

import { activate } from "./../../src/Services/Indentation"

import { Configuration } from "./../../src/Services/Configuration"
import { EditorManager } from "./../../src/Services/EditorManager"

import { MockBuffer, MockEditor } from "./../Mocks"
import * as TestHelpers from "./../TestHelpers"

describe("IndentationTests", () => {
    let configuration: Configuration
    let editorManager: EditorManager
    let mockEditor: MockEditor

    beforeEach(() => {
        configuration = new Configuration()
        editorManager = new EditorManager()
        mockEditor = new MockEditor()
        editorManager.setActiveEditor(mockEditor)

        activate(configuration, editorManager)
    })

    describe("auto-indent", () => {
        beforeEach(() => {
            configuration.setValue("editor.detectIndentation", true)
        })

        it("sets text options for spaces when entering buffer", async () => {
            mockEditor.simulateBufferEnter(new MockBuffer("", "file1.txt", ["a", "   b", "   c"]))

            await TestHelpers.waitForAllAsyncOperations()

            const options = mockEditor.textOptions

            assert.deepEqual(options, {
                tabSize: 3,
                insertSpacesForTab: true,
            })
        })

        it("sets text options for tabs when entering buffer", async () => {
            mockEditor.simulateBufferEnter(new MockBuffer("", "file1.txt", ["a", "\tb", "\t\tc"]))

            await TestHelpers.waitForAllAsyncOperations()

            const options = mockEditor.textOptions

            assert.deepEqual(options, {
                tabSize: 3,
                insertSpacesForTab: false,
            })
        })
    })
})
