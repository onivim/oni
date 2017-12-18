/**
 * LanguageEditorIntegrationTests
 */

import test from "ava"
import * as sinon from "sinon"

// import * as types from "vscode-languageserver-types"

import { EditorManager } from "../src/Services/EditorManager"

import * as Language from "../src/Services/Language"

import * as Mocks from "./Mocks"
import MockLanguageClient from "./Mocks/LanguageClient"

// const clock: any = global["clock"] // tslint:disable-line
const waitForPromiseResolution: any = global["waitForPromiseResolution"] // tslint:disable-line

// Mocks
let mockConfiguration: Mocks.MockConfiguration
let mockEditor: Mocks.MockEditor
let editorManager: EditorManager

// Class under test
let languageManager: Language.LanguageManager

test.beforeEach(() => {
    mockConfiguration = new Mocks.MockConfiguration({
        "editor.quickInfo.delay": 500,
        "editor.quickInfo.enabled": true,
    })

    editorManager = new EditorManager()
    mockEditor = new Mocks.MockEditor()
    editorManager.setActiveEditor(mockEditor)

    languageManager = new Language.LanguageManager(mockConfiguration as any, editorManager)
})

test("LanguageManager sends didOpen request if language server is registered after enter event", async (t) => {
    // Simulate entering a buffer _before_ the language server is registered
    // This can happen if a plugin registers a language server, because we spin
    // up the editors before initializing plugins.
    const mockBuffer = new Mocks.MockBuffer("javascript", "test.js", ["a", "b", "c"])
    mockEditor.simulateBufferEnter(mockBuffer)

    const mockLanguageClient = new MockLanguageClient()

    const sendRequestSpy = sinon.spy(mockLanguageClient, "sendNotification")

    // Validate that after registering the client, we had a call to 'textDocument/didOpen'
    // with the contents of the buffer.
    languageManager.registerLanguageClient("javascript", mockLanguageClient)

    // Wait for any pending promises to drain
    await waitForPromiseResolution()

    // Verify "sendNotification" was called
    t.is(sendRequestSpy.callCount, 1)

    const [filePath, notificationName] = sendRequestSpy.getCall(0).args

    t.is(filePath, "test.js")
    t.is(notificationName, "textDocument/didOpen")
})

