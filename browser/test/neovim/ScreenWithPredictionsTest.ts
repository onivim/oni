/**
 * NeovimTokenColorSynchronizerTests.ts
 */

import * as assert from "assert"

import { ScreenWithPredictions } from "./../../src/neovim/ScreenWithPredictions"
import { ITypingPrediction } from "./../../src/Services/TypingPredictionManager"

import { MockScreen } from "./../Mocks/neovim"
import { MockConfiguration } from "./../Mocks"

const createTypingPredictions = (
    predictedCursorColumn: number,
    backgroundColor: string,
    foregroundColor: string,
    predictedCharacters: string[],
): ITypingPrediction => ({
    predictedCursorColumn,
    backgroundColor,
    foregroundColor,
    predictedCharacters: predictedCharacters.map((s, idx) => ({ id: idx, character: s })),
})

const createCell = (character: string) => ({
    backgroundColor: "purple",
    foregroundColor: "gray",
    character,
    characterWidth: 1,
})

describe("ScreenWithPredictions", () => {
    let mockScreen: MockScreen
    let predictedScreen: ScreenWithPredictions
    let mockConfiguration: MockConfiguration

    beforeEach(() => {
        mockScreen = new MockScreen()
        mockConfiguration = new MockConfiguration()
        predictedScreen = new ScreenWithPredictions(mockScreen, mockConfiguration as any)
    })

    describe("updatePredictions", () => {
        it("updates cell when a prediction is available", async () => {
            mockScreen.setCell(0, 0, createCell("a"))
            predictedScreen.updatePredictions(
                createTypingPredictions(3, "yellow", "green", ["b", "c"]),
                0,
            )

            const firstPredictedCell = predictedScreen.getCell(1, 0)
            const secondPredictedCell = predictedScreen.getCell(2, 0)
            assert.strictEqual(firstPredictedCell.character, "b")
            assert.strictEqual(secondPredictedCell.character, "c")
        })

        it("highlights cell when 'debug.showTypingPrediction' is enabled", () => {
            mockConfiguration.setValue("debug.showTypingPrediction", true)
            mockScreen.setCell(0, 0, createCell("a"))
            predictedScreen.updatePredictions(
                createTypingPredictions(2, "yellow", "green", ["b"]),
                0,
            )

            const predictedCell = predictedScreen.getCell(1, 0)
            // Validate colos are overridden
            assert.strictEqual(predictedCell.backgroundColor, "red")
            assert.strictEqual(predictedCell.foregroundColor, "white")
        })
    })
})
