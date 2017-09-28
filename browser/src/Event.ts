/**
 * Event.ts
 */

import { EventEmitter } from "events"

import { IDisposable } from "./IDisposable"

export type EventCallback<T> = (value: T) => void

export interface IEvent<T> {
    subscribe(callback: EventCallback<T>): IDisposable
}

export class Event<T> implements IEvent<T> {

    private _name: string
    private _eventObject: EventEmitter = new EventEmitter()

    constructor(name?: string) {
        this._name = name || "default_event"
    }

    public subscribe(callback: EventCallback<T>): IDisposable {
        this._eventObject.addListener(this._name, callback)

        const dispose = () => {
            this._eventObject.removeListener(this._name, callback)
        }

        return { dispose }
    }

    public dispatch(val?: T): void {
        this._eventObject.emit(this._name, val)
    }
}
