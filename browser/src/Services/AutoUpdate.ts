/**
 * AutoUpdate.ts
 *
 * Provides auto-update functionality
 * - Check for update
 * - Notifies when an update is available
 */

import * as os from "os"

import { Observable } from "rxjs/Observable"
import { Subject } from "rxjs/Subject"

import { getMetadata } from "./Metadata"

import { configuration } from "./Configuration"

export interface IAutoUpdater {
    onUpdateNotAvailable: Observable<void>
    onUpdateAvailable: Observable<void>
    checkForUpdates(url: string): void
}

export const constructFeedUrl = async (baseUrl: string) => {
    const plat = os.platform()
    const { version } = await getMetadata()

    const isDevelopment = process.env["NODE_ENV"] === "development" // tslint:disable-line no-string-literal
    const channel = isDevelopment ? "development" : "release"

    return baseUrl + `?platform=${plat}&version=${version}&channel=${channel}`
}

export class AutoUpdater implements IAutoUpdater {
    private _onUpdateAvailable: Subject<void> = new Subject()
    private _onUpdateNotAvailable: Subject<void> = new Subject()

    public get onUpdateNotAvailable(): Observable<void> {
        return this._onUpdateNotAvailable
    }
    public get onUpdateAvailable(): Observable<void> {
        return this._onUpdateAvailable
    }

    public checkForUpdates(url: string): void {
        if (!configuration.getValue("autoUpdate.enabled")) {
            return
        }

        fetch(url).then(response => {
            if (response.status === 204) {
                this._onUpdateNotAvailable.next()
            } else {
                this._onUpdateAvailable.next()
            }
        })
    }
}

export const autoUpdater = new AutoUpdater()
