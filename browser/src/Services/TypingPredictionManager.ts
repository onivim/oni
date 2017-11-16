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

    private _nextPredictionId = 1
    private _predictionsChanged: Event<IPredictedCharacter[]> = new Event<IPredictedCharacter[]>()
    private _predictions: IPredictedCharacter[] = []
    private _completedPredictions: TypingPredictionId[] = []
    private _enabled: boolean = false

    public get onPredictionsChanged(): IEvent<IPredictedCharacter[]> {
        return this._predictionsChanged
    }

    public enable(): void {
        this._enabled = true
    }

    public disable(): void {
        this._enabled = false
    }

    public addPrediction(character: string): TypingPredictionId | null {

        if (!this._enabled) {
            return null
        }

        const id = this._nextPredictionId
        this._nextPredictionId++

        this._predictions = [
            ...this._predictions,
            { id, character }
        ]

        this._notifyPredictionsChanged()

        console.log("Added prediction with character: " + character + " and id: " + id)

        return id
    }

    public getLatestPredictionForCharacter(character: string): TypingPredictionId | null {
        for (let i = this._predictions.length - 1; i >= 0; i--) {
            if (this._predictions[i].character === character) {
                console.log("get latest prediction for character: " + character + " id: " + this._predictions[i].id)
                return this._predictions[i].id
            }
        }

        return null
    }

    public notifyPredictionComplete(id: TypingPredictionId): void {
        console.log("Prediction complete: " + id)
        this._completedPredictions.push(id)
    }

    public clearCompletedPredictions(): void {
        console.log("clearCompletedPredictions")
        this._predictions = this._predictions.filter((prediction) => {
            return this._completedPredictions.indexOf(prediction.id) === -1
        })

        this._completedPredictions = []

        this._notifyPredictionsChanged()
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
