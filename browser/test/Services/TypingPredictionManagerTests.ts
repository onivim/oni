/**
 * TypingPredictionManagerTests
 */

import * as assert from "assert"

import { ITypingPrediction, TypingPredictionManager } from "./../../src/Services/TypingPredictionManager"
import { MockScreen } from "./../Mocks/neovim"

describe("TypingPredictionManager", () => {

    let mockScreen: MockScreen
    let typingPredictionManager: TypingPredictionManager

    beforeEach(() => {
        mockScreen = new MockScreen()
        mockScreen.backgroundColor = "black"
        mockScreen.foregroundColor = "white"

        typingPredictionManager = new TypingPredictionManager()
        typingPredictionManager.enable()
    })

    it("Fires prediction changed event when character added", () => {
        mockScreen.cursorRow = 1
        mockScreen.cursorColumn = 1
        typingPredictionManager.setCursorPosition(mockScreen)

        let callCount = 0
        let lastResult: ITypingPrediction = null
        typingPredictionManager.onPredictionsChanged.subscribe((pd) => {
            lastResult = pd
            callCount++
        })

        typingPredictionManager.addPrediction("a")

        assert.strictEqual(callCount, 1, "Verify prediction handler was fired exactly once")
        assert.strictEqual(lastResult.backgroundColor, "black", "Verify background color came from the screen")
        assert.strictEqual(lastResult.foregroundColor, "white", "Verify foreground color came from the screen")
        assert.strictEqual(lastResult.predictedCursorColumn, 2, "Verify predictedCursorColumn is correct")
        assert.strictEqual(lastResult.predictedCharacters.length, 1, "Verify there is exactly one prediction in lastResult")
        assert.deepEqual(lastResult.predictedCharacters[0].character, "a", "Verify predicted character is correct")
    })
})
