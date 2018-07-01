/**
 * ScreenWithPredictions
 *
 * Wrapper over the screen that facilitates storing temporary 'typing predictions' -
 * keystrokes we get prior to be round-tripped to Neovim.
 */

import { ICell, IScreen } from "./Screen"

import { Configuration } from "./../Services/Configuration"
import { ITypingPrediction } from "./../Services/TypingPredictionManager"

export class ScreenWithPredictions {
    private _predictedRow: number = -1
    private _predictions: { [key: number]: ICell } = {}

    constructor(private _screen: IScreen, private _configuration: Configuration) {}

    public getCell = (x: number, y: number) => {
        if (y === this._predictedRow && this._predictions[x]) {
            return this._predictions[x]
        }

        const cell = this._screen.getCell(x, y)
        return cell
    }

    public updatePredictions(predictions: ITypingPrediction, row: number): void {
        this._predictedRow = row
        this._predictions = {}

        const debugHighlightingPredictions = this._configuration.getValue(
            "debug.showTypingPrediction",
        )
        const predictionBackgroundColor = debugHighlightingPredictions
            ? "red"
            : predictions.backgroundColor
        const predictionForegroundColor = debugHighlightingPredictions
            ? "white"
            : predictions.foregroundColor

        for (let i = 0; i < predictions.predictedCharacters.length; i++) {
            const column =
                predictions.predictedCursorColumn - (predictions.predictedCharacters.length - i)

            const cell: ICell = {
                character: predictions.predictedCharacters[i].character,
                characterWidth: 1,
                backgroundColor: predictionBackgroundColor,
                foregroundColor: predictionForegroundColor,
            }

            this._predictions[column] = cell
        }
    }

    public get linePaddingInPixels(): number {
        return this._screen.linePaddingInPixels
    }

    public get fontFamily(): string {
        return this._screen.fontFamily
    }

    public get fontSize(): string {
        return this._screen.fontSize
    }

    public get backgroundColor(): string {
        return this._screen.backgroundColor
    }

    public get foregroundColor(): string {
        return this._screen.foregroundColor
    }

    public get width(): number {
        return this._screen.width
    }

    public get height(): number {
        return this._screen.height
    }

    public get fontWidthInPixels(): number {
        return this._screen.fontWidthInPixels
    }

    public get fontHeightInPixels(): number {
        return this._screen.fontHeightInPixels
    }

    public get fontWeight(): string {
        return this._screen.fontWeight
    }
}
