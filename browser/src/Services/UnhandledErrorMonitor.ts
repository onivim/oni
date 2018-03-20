/**
 * UnhandledErrorMonitor
 *
 * Helper module to listen to unhandled errors
 */

import { Event, IEvent } from "oni-types"

import { Configuration } from "./Configuration"
import { Notifications } from "./Notifications"

import * as Log from "./../Log"

export class UnhandledErrorMonitor {
    private _onUnhandledErrorEvent = new Event<Error>()
    private _onUnhandledRejectionEvent = new Event<string>()

    private _queuedErrors: Error[] = []
    private _queuedRejections: string[] = []
    private _started: boolean = false

    public get onUnhandledError(): IEvent<Error> {
        return this._onUnhandledErrorEvent
    }

    public get onUnhandledRejection(): IEvent<string> {
        return this._onUnhandledRejectionEvent
    }

    constructor() {
        window.addEventListener("unhandledrejection", (evt: any) => {
            if (!this._started) {
                this._queuedRejections.push(evt.reason)
            }

            this._onUnhandledRejectionEvent.dispatch(evt.reason)
        })

        window.addEventListener("error", (evt: ErrorEvent) => {
            if (!this._started) {
                const hasOccured = this._queuedErrors.find(e => e.name === evt.error.name)
                if (!hasOccured) {
                    this._queuedErrors.push(evt.error)
                }
            }

            this._onUnhandledErrorEvent.dispatch(evt.error)
        })
    }

    public start(): void {
        this._started = true

        this._queuedRejections.forEach(rejection =>
            this._onUnhandledRejectionEvent.dispatch(rejection),
        )
        this._queuedErrors.forEach(err => this._onUnhandledErrorEvent.dispatch(err))

        this._queuedErrors = []
        this._queuedRejections = []
    }
}

let _unhandledErrorMonitor: UnhandledErrorMonitor = null

export const activate = () => {
    if (!_unhandledErrorMonitor) {
        _unhandledErrorMonitor = new UnhandledErrorMonitor()
    }
}

import { remote } from "electron"

export const start = (configuration: Configuration, notifications: Notifications) => {
    const showError = (title: string, errorText: string) => {
        if (!configuration.getValue("debug.showNotificationOnError")) {
            Log.error("Received notification for - " + title + ":" + errorText)
            return
        }

        const notification = notifications.createItem()

        notification.onClick.subscribe(() => {
            remote.getCurrentWebContents().openDevTools()
        })

        notification.setLevel("error")
        notification.setContents(title, errorText)
        notification.show()
    }

    _unhandledErrorMonitor.onUnhandledError.subscribe(val => {
        const errorText = val ? val.toString() : "Open the debugger for more details."
        showError(
            "Unhandled Exception",
            errorText + "\nPlease report this error. Callstack: " + val.stack,
        )
    })

    _unhandledErrorMonitor.onUnhandledRejection.subscribe(val => {
        const errorText: string = val ? val.toString() : "Open the debugger for more details."
        showError("Unhandled Rejection", errorText + "\nPlease report this error.")
    })
}
