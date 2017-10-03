import * as fs from "fs"
import * as cloneDeep from "lodash/cloneDeep"
import * as isError from "lodash/isError"
import * as path from "path"

import * as Log from "./Log"
import * as Performance from "./Performance"
import * as Platform from "./Platform"

import { Event, IEvent } from "./Event"

import { applyDefaultKeyBindings } from "./Input/KeyBindings"

import { diff } from "./Utility"

export interface IConfigValues {

    "activate": (oni: Oni.Plugin.Api) => void
    "deactivate": () => void

    // Debug settings
    "debug.fixedSize": {
        rows: number,
        columns: number,
    } | null

    // Option to override neovim path. Used for testing new versions before bringing them in.
    "debug.neovimPath": string | null

    // Production settings

    // Bell sound effect to use
    // See `:help bell` for instances where the bell sound would be used
    "oni.audio.bellUrl": string

    // The default config is an opinionated, prescribed set of plugins. This is on by default to provide
    // a good out-of-box experience, but will likely conflict with a Vim/Neovim veteran's finely honed config.
    //
    // Set this to 'false' to avoid loading the default config, and load settings from init.vim instead.
    "oni.useDefaultConfig": boolean

    // By default, user's init.vim is not loaded, to avoid conflicts.
    // Set this to `true` to enable loading of init.vim.
    "oni.loadInitVim": boolean

    // Sets the `popupmenu_external` option in Neovim
    // This will override the default UI to show a consistent popupmenu,
    // whether using Oni's completion mechanisms or VIMs
    //
    // Use caution when changing the `menuopt` parameters if using
    // a custom init.vim, as that may cause problematic behavior
    "oni.useExternalPopupMenu": boolean

    // If true, hide Menu bar by default
    // (can still be activated by pressing 'Alt')
    "oni.hideMenu": boolean

    // glob pattern of files to exclude from fuzzy finder (Ctrl-P)
    "oni.exclude": string[]

    // bookmarks to open if opened in install dir
    "oni.bookmarks": string[]

    // Editor settings

    "editor.backgroundOpacity": number
    "editor.backgroundImageUrl": string
    "editor.backgroundImageSize": string

    // Setting this to true enables yank integration with Oni
    // When true, and text is yanked / deleted, that text will
    // automatically be put on the clipboard.
    //
    // In addition, this enables <C-v> and <Cmd-v> behavior
    // in paste from clipboard in insert mode.
    "editor.clipboard.enabled": boolean

    "editor.quickInfo.enabled": boolean
    // Delay (in ms) for showing QuickInfo, when the cursor is on a term
    "editor.quickInfo.delay": number

    "editor.completions.enabled": boolean
    "editor.errors.slideOnFocus": boolean
    "editor.formatting.formatOnSwitchToNormalMode": boolean // TODO: Make this setting reliable. If formatting is slow, it will hose edits... not fun

    // If true (default), ligatures are enabled
    "editor.fontLigatures": boolean
    "editor.fontSize": string
    "editor.fontFamily": string // Platform specific

    // Additional padding between lines
    "editor.linePadding": number

    // If true (default), the buffer scroll bar will be visible
    "editor.scrollBar.visible": boolean

    // Additional paths to include when launching sub-process from Oni
    // (and available in terminal integration, later)
    "environment.additionalPaths": string[]

    // Command to list files for 'quick open'
    // For example, to use 'ag': ag --nocolor -l .
    //
    // The command must emit a list of filenames
    //
    // IE, Windows:
    // "editor.quickOpen.execCommand": "dir /s /b"
    "editor.quickOpen.execCommand": string | null

    "editor.fullScreenOnStart": boolean

    "editor.cursorLine": boolean
    "editor.cursorLineOpacity": number

    "editor.cursorColumn": boolean
    "editor.cursorColumnOpacity": number

    "statusbar.enabled": boolean
    "statusbar.fontSize": string

    "tabs.enabled": boolean
    "tabs.showVimTabs": boolean
}

const noop = () => { } // tslint:disable-line no-empty

export class Config {

    public userJsConfig = path.join(this.getUserFolder(), "config.js")

    private DefaultConfig: IConfigValues = {
        activate: noop,
        deactivate: noop,

        "debug.fixedSize": null,
        "debug.neovimPath": null,

        "oni.audio.bellUrl": path.join(__dirname, "audio", "beep.wav"),

        "oni.useDefaultConfig": true,

        "oni.loadInitVim": false,

        "oni.useExternalPopupMenu": true,

        "oni.hideMenu": false,

        "oni.exclude": ["**/node_modules/**"],
        "oni.bookmarks": [],

        "editor.backgroundOpacity": 1.0,
        "editor.backgroundImageUrl": null,
        "editor.backgroundImageSize": "initial",

        "editor.clipboard.enabled": true,

        "editor.quickInfo.enabled": true,
        "editor.quickInfo.delay": 500,

        "editor.completions.enabled": true,
        "editor.errors.slideOnFocus": true,
        "editor.formatting.formatOnSwitchToNormalMode": false,

        "editor.fontLigatures": true,
        "editor.fontSize": "12px",
        "editor.fontFamily": "",

        "editor.linePadding": 2,

        "editor.quickOpen.execCommand": null,

        "editor.scrollBar.visible": true,

        "editor.fullScreenOnStart" : false,

        "editor.cursorLine": true,
        "editor.cursorLineOpacity" : 0.1,

        "editor.cursorColumn": false,
        "editor.cursorColumnOpacity": 0.1,

        "environment.additionalPaths": [],

        "statusbar.enabled": true,
        "statusbar.fontSize": "0.9em",

        "tabs.enabled": true,
        "tabs.showVimTabs": false,
    }

    private MacConfig: Partial<IConfigValues> = {
        "editor.fontFamily": "Menlo",
        "environment.additionalPaths": [
            "/usr/bin",
            "/usr/local/bin",
        ],
    }

    private WindowsConfig: Partial<IConfigValues> = {
        "editor.fontFamily": "Consolas",
    }

    private LinuxConfig: Partial<IConfigValues> = {
        "editor.fontFamily": "DejaVu Sans Mono",
        "environment.additionalPaths": [
            "/usr/bin",
            "/usr/local/bin",
        ],
    }

    private DefaultPlatformConfig = Platform.isWindows() ? this.WindowsConfig : Platform.isLinux() ? this.LinuxConfig : this.MacConfig

    private _onConfigurationChangedEvent: Event<Partial<IConfigValues>> = new Event<Partial<IConfigValues>>()

    private _oniApi: Oni.Plugin.Api = null

    private _config: IConfigValues = null

    public get onConfigurationChanged(): IEvent<Partial<IConfigValues>> {
        return this._onConfigurationChangedEvent
    }

    constructor() {
        Performance.mark("Config.load.start")

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
                if ((event === "change" && filename === "config.js") ||
                     (event === "rename" && filename === "config.js")) {
                    // invalidate the Config currently stored in cache
                    delete global["require"].cache[global["require"].resolve(this.userJsConfig)] // tslint:disable-line no-string-literal
                    this.applyConfig()
                }
            })
        }

        Performance.mark("Config.load.end")
    }

    public hasValue(configValue: keyof IConfigValues): boolean {
        return !!this.getValue(configValue)
    }

    public getValue<K extends keyof IConfigValues>(configValue: K, defaultValue?: any) {
        if (typeof this._config[configValue] === "undefined") {
            return defaultValue
        } else {
            return this._config[configValue]
        }
    }

    public getValues(): IConfigValues {
        return cloneDeep(this._config)
    }

    public getUserFolder(): string {
        return path.join(Platform.getUserHome(), ".oni")
    }

    // Emitting event is not enough, at startup nobody's listening yet
    // so we can't emit the parsing error to anyone when it happens
    public getParsingError(): Error | null {
        const maybeError = this.getUserRuntimeConfig()
        return isError(maybeError) ? maybeError : null
    }

    public activate(oni: Oni.Plugin.Api): void {
        this._oniApi = oni

        this._activateIfOniObjectIsAvailable()
    }

    private applyConfig(): void {
        const previousConfig = this._config

        const userRuntimeConfigOrError = this.getUserRuntimeConfig()
        if (isError(userRuntimeConfigOrError)) {
            Log.error(userRuntimeConfigOrError)
            this._config = { ...this.DefaultConfig, ...this.DefaultPlatformConfig}
        } else {
            this._config = { ...this.DefaultConfig, ...this.DefaultPlatformConfig, ...userRuntimeConfigOrError}
        }

        this._deactivate()
        this._activateIfOniObjectIsAvailable()

        this._notifyListeners(previousConfig)
    }

    private _activateIfOniObjectIsAvailable(): void {
        if (this._config && this._config.activate && this._oniApi) {
            applyDefaultKeyBindings(this._oniApi, this)

            try {
                this._config.activate(this._oniApi)
            } catch (e) {
                alert("[Config Error] Failed to activate " + this.userJsConfig + ":\n" + (e as Error).message)
            }
        }
    }

    private _deactivate(): void {
        if (this._config && this._config.deactivate) {
            this._config.deactivate()
        }
    }

    private getUserRuntimeConfig(): IConfigValues | Error {
        let userRuntimeConfig: IConfigValues | null = null
        let error: Error | null = null
        if (fs.existsSync(this.userJsConfig)) {
            try {
                userRuntimeConfig = global["require"](this.userJsConfig) // tslint:disable-line no-string-literal
            } catch (e) {
                e.message = "[Config Error] Failed to parse " + this.userJsConfig + ":\n" + (e as Error).message
                error = e

                alert(e.message)
            }
        }
        return error ? error : userRuntimeConfig
    }

    private _notifyListeners(previousConfig?: Partial<IConfigValues>): void {
        previousConfig = previousConfig || {}

        const changedValues = diff(this._config, previousConfig)

        const diffObject = changedValues.reduce((previous: Partial<IConfigValues>, current: string) => {

            const currentValue = this._config[current]

            // Skip functions, because those will always be different
            if (currentValue && typeof currentValue === "function") {
                return previous
            }

            return {
                ...previous,
                [current]: this._config[current],
            }
        }, {})

        this._onConfigurationChangedEvent.dispatch(diffObject)
    }
}

const _config = new Config()
export const instance = () => _config
