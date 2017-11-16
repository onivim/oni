/**
 * TypingPredictionManager
 *
 * Handles typing-prediction state management
 */

import { Event, IEvent } from "./../Event"

export type TypingPredictionId = number

export interface IPredictedCharacter {
    character: string
    id: number
}

export class TypingPredictionManager {

    private _predictionsChanged: Event<IPredictedCharacter[]> = new Event<IPredictedCharacter[]>()
    private _predictions: IPredictedCharacter[] = []
    private _completedPredictions: TypingPredictionId[] = []
    private _enabled: boolean = false

    private _line: number = null
    private _column: number = null

    public get onPredictionsChanged(): IEvent<IPredictedCharacter[]> {
        return this._predictionsChanged
    }

    public enable(): void {
        this._enabled = true
    }

    public disable(): void {
        this._enabled = false
    }


    public setCursorPosition(line: number, column: number): void {

        if (this._line !== line) {
            this.clearAllPredictions()
        }

        this._line = line
        this._column = column

        this._predictions = this._predictions.filter((pd) => {
            return pd.id > this._column
        })

        this._notifyPredictionsChanged()
    }

    public addPrediction(character: string): TypingPredictionId | null {

        if (!this._enabled) {
            return null
        }

        const id = this._column + this._predictions.length + 1

        this._predictions = [
            ...this._predictions,
            { id, character }
        ]

        this._notifyPredictionsChanged()

        console.log("Added prediction with character: " + character + " and id: " + id)

        return id
    }

    public clearAllPredictions(): void {
        console.log("clearAllPredictions")
        this._predictions = []
        this._completedPredictions = []

        this._notifyPredictionsChanged()
    }

    private _notifyPredictionsChanged(): void {
        this._predictionsChanged.dispatch(this._predictions)
    }
}
