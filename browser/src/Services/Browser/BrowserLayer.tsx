/**
 * BrowserLayer.tsx
 *
 * Buffer layer for browser functionality
 */

import * as React from "react"

import * as Oni from "oni-api"
import { Event } from "oni-types"

import { Configuration } from "./../Configuration"

import { BrowserView } from "./BrowserView"

export class BrowserLayer implements Oni.BufferLayer {
    private _debugEvent = new Event<void>()
    private _goBackEvent = new Event<void>()
    private _goForwardEvent = new Event<void>()
    private _reloadEvent = new Event<void>()

    constructor(private _url: string, private _configuration: Configuration) {}

    public get id(): string {
        return "oni.layer.browser"
    }

    public render(): JSX.Element {
        return (
            <BrowserView
                configuration={this._configuration}
                initialUrl={this._url}
                goBack={this._goBackEvent}
                goForward={this._goForwardEvent}
                reload={this._reloadEvent}
                debug={this._debugEvent}
            />
        )
    }

    public openDebugger(): void {
        this._debugEvent.dispatch()
    }

    public goBack(): void {
        this._goBackEvent.dispatch()
    }

    public goForward(): void {
        this._goForwardEvent.dispatch()
    }

    public reload(): void {
        this._reloadEvent.dispatch()
    }
}
