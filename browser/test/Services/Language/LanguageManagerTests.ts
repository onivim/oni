/**
 * LanguageEditorIntegrationTests
 */

import * as assert from "assert"

import { Event } from "oni-types"

// import * as types from "vscode-languageserver-types"

import { EditorManager } from "./../../../src/Services/EditorManager"

import * as Language from "./../../../src/Services/Language"

import * as Mocks from "./../../Mocks"

export class MockLanguageClient implements Language.ILanguageClient {
    
    public serverCapabilities: any = {}

    public subscribe(notificationName: string, evt: Event<any>): void {
        
    }

    public handleRequest(requestName: string, handler: Language.RequestHandler): void {
        
    }

    public sendRequest<T>(fileName: string, requestName: string, protocolArguments: Language.NotificationValueOrThunk): Promise<T> {
        return Promise.resolve(null)
    }

    public sendNotification(fileName: string, notificationName: string, protocolArguments: Language.NotificationValueOrThunk): void {
        
    }
}

describe("LanguageManager", () => {
    // const clock: any = global["clock"] // tslint:disable-line
    // const waitForPromiseResolution: any = global["waitForPromiseResolution"] // tslint:disable-line

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
        })

        editorManager = new EditorManager()
        mockEditor = new Mocks.MockEditor()
        editorManager.setActiveEditor(mockEditor)

        languageManager = new Language.LanguageManager(mockConfiguration as any, editorManager)
    })

    it.only("sends didOpen request if language server is registered after enter event", async () => {
        const mockLanguageClient = new MockLanguageClient()
        languageManager.registerLanguageClient("javascript", mockLanguageClient)
        assert.ok(false, "fails")
    })
})
