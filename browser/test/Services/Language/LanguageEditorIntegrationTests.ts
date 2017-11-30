/**
 * LanguageEditorIntegrationTests
 */

import * as assert from "assert"

import * as Language from "./../../../src/Services/Language"

import * as Mocks from "./../../Mocks"

describe("LanguageEditorIntegration", () => {
    let clock: any = global["clock"]

    // Mocks
    let mockConfiguration: Mocks.MockConfiguration
    let mockEditor: Mocks.MockEditor
    let mockDefinitionRequestor: Mocks.MockDefinitionRequestor
    let mockHoverRequestor: Mocks.MockHoverRequestor

    // Class under test
    let languageEditorIntegration: Language.LanguageEditorIntegration

    beforeEach(() => {
        mockConfiguration = new Mocks.MockConfiguration({
            "editor.quickInfo.delay": 1,
        })

        mockEditor = new Mocks.MockEditor()
        mockDefinitionRequestor = new Mocks.MockDefinitionRequestor()
        mockHoverRequestor = new Mocks.MockHoverRequestor()
        languageEditorIntegration = new Language.LanguageEditorIntegration(mockEditor, mockConfiguration as any, null, mockDefinitionRequestor, mockHoverRequestor)
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

        clock.tick(1) // Account for the quickInfo.delay

        assert.strictEqual(mockDefinitionRequestor.pendingCallCount, 1)
        assert.strictEqual(mockHoverRequestor.pendingCallCount, 1)

        // Resolve the calls
        mockDefinitionRequestor.resolve({} as any)
        mockHoverRequestor.resolve({} as any)

        await global["waitForPromiseResolution"]()

        console.log("Before a bunch of ticks...")

        clock.runAll()

        assert.strictEqual(showDefinitionCount, 1, "Definition was shown")
        assert.strictEqual(showHoverCount, 1, "Hover was shown")
    })

    it.only("respects editor.quickInfo.delay setting for hover", () => {
        mockConfiguration.setValue("editor.quickInfo.delay", 500)

        // Get the editor primed for a request
        mockEditor.simulateModeChange("normal")
        mockEditor.simulateBufferEnter(new Mocks.MockBuffer())
        mockEditor.simulateCursorMoved(1, 1)

        // There shouldn't be any requests yet, because
        // we haven't hit the delay..
        assert.strictEqual(mockHoverRequestor.pendingCallCount, 0)

        // Tick just past the delay
        clock.tick(501)

        // There should now be a request queued up
        assert.strictEqual(mockHoverRequestor.pendingCallCount, 1)
    })

    it("hides quick info and hover when cursor moves", () => {
        assert.ok(false, "TODO")
    })

    it("doesn't show slow request that completes after cursor moves", () => {
        assert.ok(false, "TODO")
    })

    it("does not show hover when changing buffers", () => {
        const mockConfiguration = new Mocks.MockConfiguration()
        const mockEditor = new Mocks.MockEditor()

        const lei = new Language.LanguageEditorIntegration(mockEditor, mockConfiguration as any, null, null, null)

        lei.dispose()
        assert.ok(false, "fails")
    })
})
