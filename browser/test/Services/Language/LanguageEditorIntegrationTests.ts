/**
 * LanguageEditorIntegrationTests
 */

import * as assert from "assert"

import * as types from "vscode-languageserver-types"

import * as Language from "./../../../src/Services/Language"

import * as Mocks from "./../../Mocks"

const createSuccessfulDefinitionResult = (): Language.IDefinitionResult => {
    return {
        location: types.Location.create("testuri", types.Range.create(1, 1, 5, 5)),
        token: {
            tokenName: "test",
            range: types.Range.create(1, 1, 2, 2),
        },
    }
}

describe("LanguageEditorIntegration", () => {
    const clock: any = global["clock"] // tslint:disable-line
    const waitForPromiseResolution: any = global["waitForPromiseResolution"] // tslint:disable-line

    // Mocks
    let mockConfiguration: Mocks.MockConfiguration
    let mockEditor: Mocks.MockEditor
    let mockDefinitionRequestor: Mocks.MockDefinitionRequestor
    let mockHoverRequestor: Mocks.MockHoverRequestor

    // Class under test
    let languageEditorIntegration: Language.LanguageEditorIntegration

    beforeEach(() => {
        mockConfiguration = new Mocks.MockConfiguration({
            "editor.quickInfo.delay": 500,
            "editor.quickInfo.enabled": true,
        })

        mockEditor = new Mocks.MockEditor()
        mockDefinitionRequestor = new Mocks.MockDefinitionRequestor()
        mockHoverRequestor = new Mocks.MockHoverRequestor()
        languageEditorIntegration = new Language.LanguageEditorIntegration(mockEditor as any, mockConfiguration as any, null, mockDefinitionRequestor, mockHoverRequestor)
    })

    afterEach(() => {
        languageEditorIntegration.dispose()
    })

    it("shows hover and definition", async () => {
        let showDefinitionCount = 0
        let showHoverCount = 0

        languageEditorIntegration.onShowDefinition.subscribe(() => showDefinitionCount++)
        languageEditorIntegration.onShowHover.subscribe(() => showHoverCount++)

        mockEditor.simulateModeChange("normal")
        mockEditor.simulateBufferEnter(new Mocks.MockBuffer())
        mockEditor.simulateCursorMoved(1, 1)

        clock.tick(501) // Account for the quickInfo.delay

        assert.strictEqual(mockDefinitionRequestor.pendingCallCount, 1)
        assert.strictEqual(mockHoverRequestor.pendingCallCount, 1)

        // Resolve the calls
        mockDefinitionRequestor.resolve(createSuccessfulDefinitionResult())
        mockHoverRequestor.resolve({} as any)

        await waitForPromiseResolution()

        clock.runAll()

        assert.strictEqual(showDefinitionCount, 1, "Definition was shown")
        assert.strictEqual(showHoverCount, 1, "Hover was shown")
    })

    it("respects editor.quickInfo.delay setting for hover", () => {

        // Get the editor primed for a request
        mockEditor.simulateModeChange("normal")
        mockEditor.simulateBufferEnter(new Mocks.MockBuffer())
        mockEditor.simulateCursorMoved(1, 1)

        // There shouldn't be any requests yet, because
        // we haven't hit the delay..
        assert.strictEqual(mockHoverRequestor.pendingCallCount, 0, "Should be no request queued yet...")

        // Tick just before the delay....
        clock.tick(499)

        assert.strictEqual(mockHoverRequestor.pendingCallCount, 0, "Should be no request queued, right before the time limit..")

        // Tick just after the delay...
        clock.tick(2)

        // There should now be a request queued up
        assert.strictEqual(mockHoverRequestor.pendingCallCount, 1, "Should now be a request pending, because we've exceeded the limit")
    })

    it("doesn't show slow hover response that completes after cursor moves", async () => {
        mockEditor.simulateModeChange("normal")
        mockEditor.simulateBufferEnter(new Mocks.MockBuffer())
        mockEditor.simulateCursorMoved(1, 1)

        let hoverShowCount = 0

        languageEditorIntegration.onShowHover.subscribe(() => hoverShowCount++)

        // Go past the clock timer, so we should get a request now
        clock.tick(501)

        assert.strictEqual(mockHoverRequestor.pendingCallCount, 1, "Verify we have a request queued up")

        // While the request is pending, lets move the cursor

        mockEditor.simulateCursorMoved(2, 2)

        // Complete the hover request, and let the promises drain
        mockHoverRequestor.resolve({} as any)
        await waitForPromiseResolution()

        // Let clock drain as well
        clock.runAll()

        assert.strictEqual(hoverShowCount, 0, "Hover should never be shown, because the cursor moved.")
    })

    it("doesn't show slow hover response that completes after mode changes", async () => {
        mockEditor.simulateModeChange("normal")
        mockEditor.simulateBufferEnter(new Mocks.MockBuffer())
        mockEditor.simulateCursorMoved(1, 1)

        let hoverShowCount = 0

        languageEditorIntegration.onShowHover.subscribe(() => hoverShowCount++)

        // Go past the clock timer, so we should get a request now
        clock.tick(501)

        assert.strictEqual(mockHoverRequestor.pendingCallCount, 1, "Verify we have a request queued up")

        // While the request is pending, lets move the cursor

        mockEditor.simulateModeChange("insert")

        // Complete the hover request, and let the promises drain
        mockHoverRequestor.resolve({} as any)
        await waitForPromiseResolution()

        // Let clock drain as well
        clock.runAll()

        assert.strictEqual(hoverShowCount, 0, "Hover should never be shown, because the cursor moved.")
    })

    it("hides hover on mode change", async () => {
        let showHoverCount = 0
        let hideHoverCount = 0

        languageEditorIntegration.onShowHover.subscribe(() => showHoverCount++)
        languageEditorIntegration.onHideHover.subscribe(() => hideHoverCount++)

        mockEditor.simulateModeChange("normal")
        mockEditor.simulateBufferEnter(new Mocks.MockBuffer())
        mockEditor.simulateCursorMoved(1, 1)

        clock.tick(501) // Account for the quickInfo.delay

        assert.strictEqual(mockHoverRequestor.pendingCallCount, 1)

        // Resolve the calls
        mockHoverRequestor.resolve({} as any)

        await waitForPromiseResolution()

        clock.runAll()

        assert.strictEqual(showHoverCount, 1, "Hover was shown")
        assert.strictEqual(hideHoverCount, 0, "No calls to hide hover yet")

        mockEditor.simulateModeChange("cmdline")

        clock.runAll()

        assert.strictEqual(showHoverCount, 1, "Hover show count should be unchanged")
        assert.strictEqual(hideHoverCount, 1, "There should now be a call to hide the hover")
    })

    it("#1063 - doesn't show hover if there are no results", async () => {
        let showDefinitionCount = 0

        languageEditorIntegration.onShowDefinition.subscribe(() => showDefinitionCount++)

        mockEditor.simulateModeChange("normal")
        mockEditor.simulateBufferEnter(new Mocks.MockBuffer())
        mockEditor.simulateCursorMoved(1, 1)

        clock.tick(501) // Account for the quickInfo.delay

        assert.strictEqual(mockDefinitionRequestor.pendingCallCount, 1)

        // Resolve the calls, simulating a null result
        // to reproduce the issue in #1063.
        //
        // In the case where we don't get a result,
        // we could still have a value for `token`,
        // but not `location`.
        mockDefinitionRequestor.resolve({
            token: {
                tokenName: "test",
                range: null,
            },
            location: null,
        })

        await waitForPromiseResolution()

        clock.runAll()

        assert.strictEqual(showDefinitionCount, 0, "Definition should not be shown")
    })

    // TEST:
    // - Selection - doesn't show code actions if selection changed while in flight
    // - Integration with diagnostics?
})
