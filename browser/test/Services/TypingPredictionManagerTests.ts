/**
 * TypingPredictionManagerTests
 */

import * as assert from "assert"

import * as Neovim from "./../../src/neovim"

import {
    ITypingPrediction,
    TypingPredictionManager,
} from "./../../src/Services/TypingPredictionManager"
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
        typingPredictionManager.onPredictionsChanged.subscribe(pd => {
            lastResult = pd
            callCount++
        })

        typingPredictionManager.addPrediction("a")

        assert.strictEqual(callCount, 1, "Verify prediction handler was fired exactly once")
        assert.strictEqual(
            lastResult.backgroundColor,
            "black",
            "Verify background color came from the screen",
        )
        assert.strictEqual(
            lastResult.foregroundColor,
            "white",
            "Verify foreground color came from the screen",
        )
        assert.strictEqual(
            lastResult.predictedCursorColumn,
            2,
            "Verify predictedCursorColumn is correct",
        )
        assert.strictEqual(
            lastResult.predictedCharacters.length,
            1,
            "Verify there is exactly one prediction in lastResult",
        )
        assert.deepEqual(
            lastResult.predictedCharacters[0].character,
            "a",
            "Verify predicted character is correct",
        )
    })

    it("#1039 - Doesn't add a prediction if it overlaps with an existing character on the screen", () => {
        mockScreen.cursorRow = 1
        mockScreen.cursorColumn = 1
        typingPredictionManager.setCursorPosition(mockScreen)

        // Set a character at the third position, so that we can test the case where there
        // is a single prediction, and a rejected prediction (because there is a character already on the cell)

        const cell: Neovim.ICell = {
            character: "T",
            characterWidth: 1,
        }

        mockScreen.setCell(3 /* x: column*/, 1 /* y: row */, cell)

        let callCount = 0
        let lastResult: ITypingPrediction = null

        typingPredictionManager.onPredictionsChanged.subscribe(pd => {
            callCount++
            lastResult = pd
        })

        typingPredictionManager.addPrediction("a") // First prediction should succeed
        typingPredictionManager.addPrediction("b") // Second prediction doesn't succeed

        assert.strictEqual(
            callCount,
            1,
            "Verify only a single call to the prediction handler was made",
        )
        assert.strictEqual(
            lastResult.predictedCharacters.length,
            1,
            "Verify there is exactly one prediction in last result",
        )
        assert.strictEqual(
            lastResult.predictedCharacters[0].character,
            "a",
            "Verify it was the first character entered that got predicted",
        )
    })
})
