/**
 * Event.ts
 */

import { EventEmitter } from "events"

import { Observable } from "rxjs/Observable"
import { Subject } from "rxjs/Subject"

import "rxjs/add/operator/auditTime"
import "rxjs/add/operator/combineLatest"
import "rxjs/add/operator/debounceTime"
import "rxjs/add/operator/distinctUntilChanged"
import "rxjs/add/operator/do"
import "rxjs/add/operator/filter"
import "rxjs/add/operator/map"
import "rxjs/add/operator/merge"
import "rxjs/add/operator/mergeMap"
import "rxjs/add/operator/switchMap"
import "rxjs/add/operator/takeLast"
import "rxjs/add/operator/withLatestFrom"

import { IDisposable } from "./IDisposable"

export type EventCallback<T> = (value: T) => void

export interface IEvent<T> {
    subscribe(callback: EventCallback<T>): IDisposable
    asObservable(): Observable<T>
}

export class Event<T> implements IEvent<T> {

    private _name: string
    private _eventObject: EventEmitter = new EventEmitter()
    private _subject: Subject<T> = null

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
        if (this._subject) {
            this._subject.next(val)
        }

        this._eventObject.emit(this._name, val)
    }

    public asObservable(): Observable<T> {
        if (!this._subject) {
            this._subject = new Subject<T>()
        }

        return this._subject
    }
}
