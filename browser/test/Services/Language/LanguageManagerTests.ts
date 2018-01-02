/**
 * LanguageEditorIntegrationTests
 */

import * as assert from "assert"

import * as sinon from "sinon"

import { Event } from "oni-types"

// import * as types from "vscode-languageserver-types"

import { EditorManager } from "./../../../src/Services/EditorManager"

import * as Language from "./../../../src/Services/Language"

import * as Mocks from "./../../Mocks"

export class MockLanguageClient implements Language.ILanguageClient {

    public serverCapabilities: any = {}

    public subscribe(notificationName: string, evt: Event<any>): void {
        // tslint: disable-line
    }

    public handleRequest(requestName: string, handler: Language.RequestHandler): void {
        // tslint: disable-line
    }

    public sendRequest<T>(fileName: string, requestName: string, protocolArguments: Language.NotificationValueOrThunk): Promise<T> {
        return Promise.resolve(null)
    }

    public sendNotification(fileName: string, notificationName: string, protocolArguments: Language.NotificationValueOrThunk): void {
        // tslint: disable-line
    }
}

describe("LanguageManager", () => {
    // const clock: any = global["clock"] // tslint:disable-line
    const waitForPromiseResolution: any = global["waitForPromiseResolution"] // tslint:disable-line

    // Mocks
    let mockConfiguration: Mocks.MockConfiguration
    let mockEditor: Mocks.MockEditor
    let editorManager: EditorManager

    // Class under test
    let languageManager: Language.LanguageManager

    beforeEach(() => {
        mockConfiguration = new Mocks.MockConfiguration({
            "editor.quickInfo.delay": 500,
            "editor.quickInfo.enabled": true,
            "status.priority": {
                "oni.status.workingDirectory": 0,
                "oni.status.linenumber": 1,
                "oni.status.mode": 0,
                "oni.status.filetype": 1,
                "oni.status.git": 2,
            },
        })

        editorManager = new EditorManager()
        mockEditor = new Mocks.MockEditor()
        editorManager.setActiveEditor(mockEditor)

        const mockStatusBar = new Mocks.MockStatusBar()

        languageManager = new Language.LanguageManager(mockConfiguration as any, editorManager, mockStatusBar)
    })

    it("sends didOpen request if language server is registered after enter event", async () => {
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
        assert.strictEqual(sendRequestSpy.callCount, 1)

        const [filePath, notificationName] = sendRequestSpy.getCall(0).args

        assert.strictEqual(filePath, "test.js")
        assert.strictEqual(notificationName, "textDocument/didOpen")
    })
})
