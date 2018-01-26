/**
 * TypingPredictionManager
 *
 * Handles typing-prediction state management
 */

import { Event, IEvent } from "oni-types"

import { IScreen } from "./../neovim"

export interface IPredictedCharacter {
    character: string
    id: number
}

export interface ITypingPrediction {
    predictedCharacters: IPredictedCharacter[]
    predictedCursorColumn: number
    backgroundColor: string
    foregroundColor: string
}

export class TypingPredictionManager {
    private _predictionsChanged: Event<ITypingPrediction> = new Event<ITypingPrediction>()
    private _predictions: IPredictedCharacter[] = []
    private _backgroundColor: string
    private _foregroundColor: string

    private _enabled: boolean = false

    private _line: number = null
    private _column: number = null

    private _latestScreenState: IScreen = null

    public get onPredictionsChanged(): IEvent<ITypingPrediction> {
        return this._predictionsChanged
    }

    public enable(): void {
        this._enabled = true
    }

    public disable(): void {
        this._enabled = false
    }

    public setCursorPosition(screen: IScreen): void {
        this._latestScreenState = screen

        const line = screen.cursorRow
        const column = screen.cursorColumn

        const { foregroundColor, backgroundColor } = getLastTextColorFromScreen(screen)

        this._foregroundColor = foregroundColor
        this._backgroundColor = backgroundColor

        let shouldClearAll = false

        // If we changed lines, our predictions are no longer valid
        if (this._line !== line) {
            shouldClearAll = true
        }

        // In the case where auto-indent pushes us back,
        // we don't have a good sense of current predictions,
        // so just clear them all out
        if (column < this._column) {
            shouldClearAll = true
        }

        this._line = line
        this._column = column

        if (shouldClearAll) {
            this.clearAllPredictions()
        } else {
            this._predictions = this._predictions.filter(pd => {
                return pd.id > this._column
            })

            this._notifyPredictionsChanged()
        }
    }

    public addPrediction(character: string): void {
        if (!this._enabled || !this._latestScreenState) {
            return null
        }

        const id = this._column + this._predictions.length + 1

        const newCharacterCell = this._latestScreenState.getCell(id, this._line)

        if (newCharacterCell && newCharacterCell.character) {
            return
        }

        this._predictions = [...this._predictions, { id, character }]

        this._notifyPredictionsChanged()
    }

    public clearAllPredictions(): void {
        this._predictions = []

        this._notifyPredictionsChanged()
    }

    private _notifyPredictionsChanged(): void {
        this._predictionsChanged.dispatch({
            predictedCharacters: this._predictions,
            predictedCursorColumn: this._column + this._predictions.length,
            backgroundColor: this._backgroundColor,
            foregroundColor: this._foregroundColor,
        })
    }
}

export const getLastTextColorFromScreen = (
    screen: IScreen,
): { foregroundColor: string; backgroundColor: string } => {
    const previousCharacterColumn = screen.cursorColumn - 2

    if (previousCharacterColumn <= 0) {
        return {
            foregroundColor: screen.foregroundColor,
            backgroundColor: screen.backgroundColor,
        }
    }

    const previousCharacter = screen.getCell(previousCharacterColumn, screen.cursorRow)

    if (previousCharacter.character) {
        return {
            foregroundColor: previousCharacter.foregroundColor || screen.foregroundColor,
            backgroundColor: previousCharacter.backgroundColor || screen.backgroundColor,
        }
    } else {
        return {
            foregroundColor: screen.foregroundColor,
            backgroundColor: screen.backgroundColor,
        }
    }
}
