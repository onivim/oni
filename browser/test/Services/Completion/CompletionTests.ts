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
        label,
        kind: types.CompletionItemKind.Variable,
    }
    return ci
}

describe("Completion", () => {
    const clock: any = global["clock"] // tslint:disable-line
    const waitForPromiseResolution: any = global["waitForPromiseResolution"] // tslint:disable-line

    // Mocks
    let mockConfiguration: Mocks.MockConfiguration
    let mockEditor: Mocks.MockEditor
    let mockLanguageManager: Mocks.MockLanguageManager
    let mockCompletionRequestor: MockCompletionRequestor

    // Class under test
    let completion: Completion.Completion

    beforeEach(() => {
        mockConfiguration = new Mocks.MockConfiguration({
            "editor.completions.mode": "oni",
        })

        mockEditor = new Mocks.MockEditor()
        mockLanguageManager = new Mocks.MockLanguageManager()
        mockCompletionRequestor = new MockCompletionRequestor()
        completion = new Completion.Completion(mockEditor, mockLanguageManager as any, mockConfiguration as any, mockCompletionRequestor)
    })

    afterEach(() => {
        completion.dispose()
    })

    it("shows completions, filtered by base", async () => {
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

    it("doesn't fetch completions if 'editor.completions.mode' === 'hidden'", () => {

        mockConfiguration.setValue("editor.completions.mode", "hidden")

        mockEditor.simulateBufferEnter(new Mocks.MockBuffer("typescript", "test1.ts", []))

        // Switch to insert mode
        mockEditor.simulateModeChange("insert")

        // Simulate typing
        mockEditor.simulateCursorMoved(0, 3)
        mockEditor.setActiveBufferLine(0, "win")

        clock.runAll()

        // Validate we do not have requests for completion, because completions are turned off.
        assert.strictEqual(mockCompletionRequestor.completionsRequestor.pendingCallCount, 0, "There should be no completion requests, because 'editor.completions.mode' is set to 'hidden'")
    })

    it("doesn't fetch completions if 'editor.completions.enabled' === 'false'", () => {

        mockConfiguration.setValue("editor.completions.enabled", false)

        mockEditor.simulateBufferEnter(new Mocks.MockBuffer("typescript", "test1.ts", []))

        // Switch to insert mode
        mockEditor.simulateModeChange("insert")

        // Simulate typing
        mockEditor.simulateCursorMoved(0, 3)
        mockEditor.setActiveBufferLine(0, "win")

        clock.runAll()

        // Validate we do not have requests for completion, because completions are turned off.
        assert.strictEqual(mockCompletionRequestor.completionsRequestor.pendingCallCount, 0, "There should be no completion requests, because 'editor.completions.enabled' is set to 'false'")
    })

    it("if there is a completion matching the base, it should be the first shown", async () => {

        mockEditor.simulateBufferEnter(new Mocks.MockBuffer("typescript", "test1.ts", []))

        // Switch to insert mode
        mockEditor.simulateModeChange("insert")

        // Simulate typing
        mockEditor.simulateCursorMoved(0, 3)
        mockEditor.setActiveBufferLine(0, "win")

        clock.runAll()

        let lastItems: Completion.ICompletionShowEventArgs = null
        completion.onShowCompletionItems.subscribe((items) => lastItems = items)

        // Validate we have a request for completions
        assert.strictEqual(mockCompletionRequestor.completionsRequestor.pendingCallCount, 1, "There should be a request for completions queued")

        const completionResults = [
            createMockCompletionItem("window"),
            createMockCompletionItem("win"),
        ]

        mockCompletionRequestor.completionsRequestor.resolve(completionResults)

        await waitForPromiseResolution()
        clock.runAll()

        assert.strictEqual(lastItems.filteredCompletions.length, 2, "Completions were resolved successfully")
        assert.deepEqual(lastItems.filteredCompletions[0], completionResults[1], "The second completion should be the first one shown, as it matches the base")
    })

    it("if mode changed while a request was in progress, there should be no completions shown", async () => {
        mockEditor.simulateBufferEnter(new Mocks.MockBuffer("typescript", "test1.ts", []))

        // Switch to insert mode
        mockEditor.simulateModeChange("insert")

        // Simulate typing
        mockEditor.simulateCursorMoved(0, 3)
        mockEditor.setActiveBufferLine(0, "win")

        clock.runAll()

        let lastItems: Completion.ICompletionShowEventArgs = null
        completion.onShowCompletionItems.subscribe((items) => lastItems = items)

        // Validate we have a request for completions
        assert.strictEqual(mockCompletionRequestor.completionsRequestor.pendingCallCount, 1, "There should be a request for completions queued")

        // While the result is pending, we'll leave insert mode -
        // we shouldn't get any completions, now!

        mockEditor.simulateModeChange("normal")

        clock.runAll()

        // Resolve the slow request...
        const completionResults = [
            createMockCompletionItem("window"),
            createMockCompletionItem("win"),
        ]

        mockCompletionRequestor.completionsRequestor.resolve(completionResults)

        await waitForPromiseResolution()
        clock.runAll()

        assert.strictEqual(lastItems, null, "Completions should be null, as we shouldn't have received them after the mode change")
    })

    it("if meet changed while the request was in progress, there should be no completions shown", async () => {
        mockEditor.simulateBufferEnter(new Mocks.MockBuffer("typescript", "test1.ts", []))

        // Switch to insert mode
        mockEditor.simulateModeChange("insert")

        // Simulate typing
        mockEditor.simulateCursorMoved(0, 3)
        mockEditor.setActiveBufferLine(0, "win")

        clock.runAll()

        let lastItems: Completion.ICompletionShowEventArgs = null
        completion.onShowCompletionItems.subscribe((items) => lastItems = items)

        // Validate we have a request for completions
        assert.strictEqual(mockCompletionRequestor.completionsRequestor.pendingCallCount, 1, "There should be a request for completions queued")

        // While the result is pending, we'll keep typing...
        // That first result should be ignored

        mockEditor.simulateCursorMoved(0, 5)
        mockEditor.setActiveBufferLine(0, "win.s")

        clock.runAll()

        // Resolve the slow request...
        const oldCompletionResults = [
            createMockCompletionItem("window"),
            createMockCompletionItem("win"),
        ]

        mockCompletionRequestor.completionsRequestor.resolve(oldCompletionResults)

        await waitForPromiseResolution()
        clock.runAll()

        assert.strictEqual(lastItems, null, "Completions should be null, as the only request that was completed was outdated")
    })

    it("#1076 - should not crash if buffer change comes before first cursor move", () => {
        mockEditor.simulateBufferEnter(new Mocks.MockBuffer("typescript", "test1.ts", []))

        // Switch to insert mode
        mockEditor.simulateModeChange("insert")

        // Simulate typing, but with the buffer update coming prior to the cursor move.
        mockEditor.setActiveBufferLine(0, "win")
        mockEditor.simulateCursorMoved(0, 3)

        assert.ok(true, "Did not crash")
    })
})
