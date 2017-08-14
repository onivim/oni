import { EventEmitter } from "events"

import * as fs from "fs"
import * as _ from "lodash"
import * as path from "path"

import * as Performance from "./Performance"
import * as Platform from "./Platform"

export type RenderStrategy = "canvas" | "dom"

export interface ITypeValues {}

export abstract class AbstractConfig extends EventEmitter {

    protected abstract userJsConfig: string
    protected abstract configFileName: string
    protected abstract configEventName: string
    protected abstract performanceName: string
    protected abstract ConfigValue: ITypeValues
    protected abstract DefaultConfig: ITypeValues
    protected abstract DefaultPlatformConfig: Partial<ITypeValues>

    protected configChanged: EventEmitter = new EventEmitter()

    constructor() {
        super()
    }

    public getUserFolder(): string {
        return path.join(Platform.getUserHome(), ".oni")
    }

    public registerListener(callback: Function): void {
        this.configChanged.on(this.configEventName, callback)
    }

    public unregisterListener(callback: Function): void {
        this.configChanged.removeListener(this.configEventName, callback)
    }
    // Emitting event is not enough, at startup nobody's listening yet
    // so we can't emit the parsing error to anyone when it happens
    public getParsingError(): Error | null {
        const maybeError = this.getUserRuntimeConfig()
        return _.isError(maybeError) ? maybeError : null
    }

    protected abstract hasValue(configValue: keyof ITypeValues): boolean;
    protected abstract getValue<K extends keyof ITypeValues>(configValue: K): any;
    protected abstract getValues(): ITypeValues;

    protected loadConfig(): void {
        Performance.mark(this.performanceName + ".load.end")

        this.applyConfig()
        // use watch() on the directory rather than on config.js because it watches
        // file references and changing a file in Vim typically saves a tmp file
        // then moves it over to the original filename, causing watch() to lose its
        // reference. Instead, watch() can watch the folder for the file changes
        // and continue to fire when file references are swapped out.
        // Unfortunately, this also means the 'change' event fires twice.
        // I could use watchFile() but that polls every 5 seconds.  Not ideal.
        if (fs.existsSync(this.getUserFolder())) {
            fs.watch(this.getUserFolder(), (event, filename) => {
                if (event === "change" && filename === this.configFileName) {
                    // invalidate the ConfigValue currently stored in cache
                    delete global["require"].cache[global["require"].resolve(this.userJsConfig)] // tslint:disable-line no-string-literal
                    this.applyConfig()
                    this.notifyListeners()
                }
            })
        }

        Performance.mark(this.performanceName + ".load.end")
    }

    private applyConfig(): void {
        let userRuntimeConfigOrError = this.getUserRuntimeConfig()
        if (_.isError(userRuntimeConfigOrError)) {
            this.emit("logError", userRuntimeConfigOrError)
            this.ConfigValue = { ...this.DefaultConfig, ...this.DefaultPlatformConfig}
        } else {
            this.ConfigValue = { ...this.DefaultConfig, ...this.DefaultPlatformConfig, ...userRuntimeConfigOrError}
        }
    }

    private getUserRuntimeConfig(): ITypeValues | Error {
        let userRuntimeConfig: ITypeValues | null = null
        let error: Error | null = null
        if (fs.existsSync(this.userJsConfig)) {
            try {
                userRuntimeConfig = global["require"](this.userJsConfig) // tslint:disable-line no-string-literal
            } catch (e) {
                e.message = "Failed to parse " + this.userJsConfig + ":\n" + (<Error>e).message
                error = e
            }
        }
        return error ? error : userRuntimeConfig
    }

    private notifyListeners(): void {
        this.configChanged.emit(this.configEventName)
    }

}
