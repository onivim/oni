/**
 * FileConfigurationProvider
 *
 * Implementation of a configuration provider backed by a file
 */

import * as fs from "fs"
import * as isError from "lodash/isError"
import * as mkdirp from "mkdirp"
import * as path from "path"

import { Subject } from "rxjs/Subject"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import * as Log from "./../../Log"

import { IConfigurationProvider } from "./Configuration"
import { IConfigurationValues } from "./IConfigurationValues"

const CONFIG_UPDATE_DEBOUNCE_TIME = 100 /*ms */

export class FileConfigurationProvider implements IConfigurationProvider {
    private _configurationFilePath: string
    private _containingFolder: string
    private _configurationChangedEvent = new Event<void>()
    private _configurationErrorEvent = new Event<Error>()
    private _latestConfiguration: Partial<IConfigurationValues> = null
    private _lastError: Error | null = null
    private _configEverHadValue: boolean = false

    private _configChangedObservable: Subject<void>
    private _configErrorObservable: Subject<Error>

    public get onConfigurationChanged(): IEvent<void> {
        return this._configurationChangedEvent
    }

    public get onConfigurationError(): IEvent<Error> {
        return this._configurationErrorEvent
    }
    
    constructor(filePath: string) {

        this._configChangedObservable = new Subject<void>()
        this._configErrorObservable = new Subject<Error>()

        this._configChangedObservable
            .debounceTime(CONFIG_UPDATE_DEBOUNCE_TIME)
            .subscribe(() => this._configurationChangedEvent.dispatch())

        this._configErrorObservable
            .debounceTime(CONFIG_UPDATE_DEBOUNCE_TIME)
            .subscribe((err: Error) => this._configurationErrorEvent.dispatch(err))

        this._configurationFilePath = filePath
        this._containingFolder = path.dirname(filePath)

        if (!fs.existsSync(this._containingFolder)) {
            mkdirp.sync(this._containingFolder)
        }

        // use watch() on the directory rather than on config.js because it watches
        // file references and changing a file in Vim typically saves a tmp file
        // then moves it over to the original filename, causing watch() to lose its
        // reference. Instead, watch() can watch the folder for the file changes
        // and continue to fire when file references are swapped out.
        // Unfortunately, this also means the 'change' event fires twice.
        // I could use watchFile() but that polls every 5 seconds.  Not ideal.
        fs.watch(this._containingFolder, (event, filename) => {
            if ((event === "change" && filename === "config.js") ||
                (event === "rename" && filename === "config.js")) {
                // invalidate the Config currently stored in cache
                delete global["require"].cache[global["require"].resolve(filePath)] // tslint:disable-line no-string-literal
                this._getLatestConfig()
            }
        })

        this._getLatestConfig()
    }

    public getValues(): Partial<IConfigurationValues> {
        return this._latestConfiguration
    }

    public getLastError(): Error | null {
        return this._lastError
    }

    public activate(api: Oni.Plugin.Api): void {
        if (this._latestConfiguration && this._latestConfiguration.activate) {
            try {
            this._latestConfiguration.activate(api)
            } catch (e) {
                alert("[Config Error] Failed to activate " + this._configurationFilePath + ":\n" + (e as Error).message)
            }
        }
    }

    public deactivate(): void {
        if (this._latestConfiguration && this._latestConfiguration.deactivate) {
            this._latestConfiguration.deactivate()
        }
    }

    private _notifyConfigurationChanged(): void {
        this._configChangedObservable.next()
    }

    private _notifyConfigurationError(err: Error): void {
        this._configErrorObservable.next(err)
    }

    private _getLatestConfig(): void {
        this._lastError = null

        let userRuntimeConfig: IConfigurationValues | null = null
        let error: Error | null = null
        if (fs.existsSync(this._configurationFilePath)) {
            try {
                userRuntimeConfig = global["require"](this._configurationFilePath) // tslint:disable-line no-string-literal
            } catch (e) {
                e.message = "[Config Error] Failed to parse " + this._configurationFilePath + ":\n" + (e as Error).message
                error = e

                this._lastError = e
                this._notifyConfigurationError(e)
            }
        }

        if (!error) {

            // If the configuration is null, but it had some value at some point,
            // we assume this is due to reading while the file write is still
            // in transition, and ignore it
            if (userRuntimeConfig === null && this._configEverHadValue) {
                Log.info("Configuraiton was null; skipping")
                return
            }

            if (isError(userRuntimeConfig)) {
                Log.error(userRuntimeConfig)
                return
            }

            if (userRuntimeConfig) {
                this._configEverHadValue = true
                this._latestConfiguration = userRuntimeConfig
                this._notifyConfigurationChanged()
            }
        }
    }
}


