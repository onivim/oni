/**
 * CompletionTests.ts
 */

import * as assert from "assert"
import * as types from "vscode-languageserver-types"

import * as Completion from "./../../../src/Services/Completion"

import * as Mocks from "./../../Mocks"

export class MockCompletionRequestor implements Completion.ICompletionsRequestor {

    private _completionsRequestor: Mocks.MockRequestor<types.CompletionItem[]> = new Mocks.MockRequestor<types.CompletionItem[]>()
    private _completionDetailsRequestor: Mocks.MockRequestor<types.CompletionItem> = new Mocks.MockRequestor<types.CompletionItem>()

    public get completionsRequestor(): Mocks.MockRequestor<types.CompletionItem[]> {
        return this._completionsRequestor
    }

    public get completionDetailsRequestor(): Mocks.MockRequestor<types.CompletionItem> {
        return this._completionDetailsRequestor
    }

    public getCompletions(fileLanguage: string, filePath: string, line: number, column: number): Promise<types.CompletionItem[]> {
        return this._completionsRequestor.get(fileLanguage, filePath, line, column)
    }

    public getCompletionDetails(fileLanguage: string, filePath: string, completionItem: types.CompletionItem): Promise<types.CompletionItem> {
        return this._completionDetailsRequestor.get(fileLanguage, filePath, completionItem)
    }

}

const createMockCompletionItem = (label: string): types.CompletionItem => {
    const ci: types.CompletionItem = {
        label: label,
        kind: types.CompletionItemKind.Variable,
    }
    return ci
}

describe("Completion", () => {
    const clock: any = global["clock"] // tslint:disable-line
    const waitForPromiseResolution: any = global["waitForPromiseResolution"] // tslint:disable-line

    // Mocks
    // let mockConfiguration: Mocks.MockConfiguration
    let mockEditor: Mocks.MockEditor
    let mockLanguageManager: Mocks.MockLanguageManager
    let mockCompletionRequestor: MockCompletionRequestor

    // Class under test
    let completion: Completion.Completion

    beforeEach(() => {
        // mockConfiguration = new Mocks.MockConfiguration({
        //     "editor.quickInfo.delay": 500,
        //     "editor.quickInfo.enabled": true,
        // })

        mockEditor = new Mocks.MockEditor()
        mockLanguageManager = new Mocks.MockLanguageManager()
        mockCompletionRequestor = new MockCompletionRequestor()
        completion = new Completion.Completion(mockEditor, mockLanguageManager as any, mockCompletionRequestor)
    })

    afterEach(() => {
        completion.dispose()
    })

    it.only("shows completions, filtered by base", async () => {
        mockEditor.simulateBufferEnter(new Mocks.MockBuffer("typescript", "test1.ts", []))

        // Switch to insert mode
        mockEditor.simulateModeChange("insert")

        // Simulate typing
        mockEditor.simulateCursorMoved(0, 1)
        mockEditor.setActiveBufferLine(0, "w")

        clock.runAll()

        let lastItems: Completion.ICompletionShowEventArgs = null
        completion.onShowCompletionItems.subscribe((items) => lastItems = items)

        // Validate we have a request for completions

        assert.strictEqual(mockCompletionRequestor.completionsRequestor.pendingCallCount, 1, "There should be a request for completions queued")

        const completionResults = [
            createMockCompletionItem("win"),
            createMockCompletionItem("window"),
        ]

        mockCompletionRequestor.completionsRequestor.resolve(completionResults)

        await waitForPromiseResolution()
        clock.runAll()

        assert.deepEqual(lastItems.filteredCompletions, completionResults, "There should now be completion results available")
        assert.deepEqual(lastItems.base, "w", "The base should be set correctly")
    })
})
