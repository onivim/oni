/**
 * CompletionTests.ts
 */

import * as assert from "assert"

import * as Completion from "./../../../src/Services/Completion"

import * as Mocks from "./../../Mocks"

describe("Completion", () => {
    const clock: any = global["clock"] // tslint:disable-line
    // const waitForPromiseResolution: any = global["waitForPromiseResolution"] // tslint:disable-line

    // Mocks
    // let mockConfiguration: Mocks.MockConfiguration
    let mockEditor: Mocks.MockEditor
    let mockLanguageManager: Mocks.MockLanguageManager

    // Class under test
    let completion: Completion.Completion

    beforeEach(() => {
        // mockConfiguration = new Mocks.MockConfiguration({
        //     "editor.quickInfo.delay": 500,
        //     "editor.quickInfo.enabled": true,
        // })

        mockEditor = new Mocks.MockEditor()
        mockLanguageManager = new Mocks.MockLanguageManager()
        completion = new Completion.Completion(mockEditor, mockLanguageManager as any)
    })

    afterEach(() => {
        completion.dispose()
    })

    it.only("shows completions, filtered by base", () => {
        mockEditor.simulateBufferEnter(new Mocks.MockBuffer("typescript", "test1.ts", []))

        // Switch to insert mode
        mockEditor.simulateModeChange("insert")

        // Simulate typing
        mockEditor.simulateCursorMoved(0, 1)
        mockEditor.setActiveBufferLine(0, "w")

        clock.tick(50)



        assert.ok(false, "fails")
    })
})
