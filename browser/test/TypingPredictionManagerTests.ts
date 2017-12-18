
import test from "ava"

import * as Neovim from "../src/neovim"

import { ITypingPrediction, TypingPredictionManager } from "../src/Services/TypingPredictionManager"
import MockScreen from "./Mocks/NeovimScreen"

let mockScreen: MockScreen
let typingPredictionManager: TypingPredictionManager

test.beforeEach(() => {
    mockScreen = new MockScreen()
    mockScreen.backgroundColor = "black"
    mockScreen.foregroundColor = "white"

    typingPredictionManager = new TypingPredictionManager()
    typingPredictionManager.enable()
})

test("Typing predictor fires prediction changed event when character added", t => {
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

    t.is(callCount, 1, "Verify prediction handler was fired exactly once")
    t.is(lastResult.backgroundColor, "black", "Verify background color came from the screen")
    t.is(lastResult.foregroundColor, "white", "Verify foreground color came from the screen")
    t.is(lastResult.predictedCursorColumn, 2, "Verify predictedCursorColumn is correct")
    t.is(lastResult.predictedCharacters.length, 1, "Verify there is exactly one prediction in lastResult")
    t.deepEqual(lastResult.predictedCharacters[0].character, "a", "Verify predicted character is correct")
})

test("#1039 - Typing predictor doesn't add a prediction if it overlaps with an existing character on the screen", t => {
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

    typingPredictionManager.onPredictionsChanged.subscribe((pd) => {
        callCount++
        lastResult = pd
    })

    typingPredictionManager.addPrediction("a") // First prediction should succeed
    typingPredictionManager.addPrediction("b") // Second prediction doesn't succeed

    t.is(callCount, 1, "Verify only a single call to the prediction handler was made")
    t.is(lastResult.predictedCharacters.length, 1, "Verify there is exactly one prediction in last result")
    t.is(lastResult.predictedCharacters[0].character, "a", "Verify it was the first character entered that got predicted")
})

