import { EventEmitter } from "events"
import * as fs from "fs"
import * as path from "path"

import * as Performance from "./Performance"
import * as Platform from "./Platform"

class Config extends EventEmitter {

    public userJsConfig = path.join(this.getUserFolder(), "config.js")

    private DefaultConfig: any = {
        // Debug settings
        "debug.incrementalRenderRegions": false,
        "debug.maxCellsToRender": 12000,

        // Production settings

        // Bell sound effect to use
        // See `:help bell` for instances where the bell sound would be used
        "oni.audio.bellUrl": path.join(__dirname, "audio", "beep.wav"),

        // The default config is an opinionated, prescribed set of plugins. This is on by default to provide
        // a good out-of-box experience, but will likely conflict with a Vim/Neovim veteran's finely honed config.
        //
        // Set this to 'false' to avoid loading the default config, and load settings from init.vim instead.
        "oni.useDefaultConfig": true,

        // By default, user's init.vim is not loaded, to avoid conflicts.
        // Set this to `true` to enable loading of init.vim.
        "oni.loadInitVim": false,

        // Sets the `popupmenu_external` option in Neovim
        // This will override the default UI to show a consistent popupmenu,
        // whether using Oni's completion mechanisms or VIMs
        //
        // Use caution when changing the `menuopt` parameters if using
        // a custom init.vim, as that may cause problematic behavior
        "oni.useExternalPopupMenu": true,

        // If true, hide Menu bar by default
        // (can still be activated by pressing 'Alt')
        "oni.hideMenu": false,

        // glob pattern of files to exclude from fuzzy finder (Ctrl-P)
        "oni.exclude": ["**/node_modules/**"],

        // Editor settings

        "editor.backgroundOpacity": 0.7,
        "editor.backgroundImageUrl": "images/background.png",
        "editor.backgroundImageSize": "initial",

        "editor.quickInfo.enabled": true,
        // Delay (in ms) for showing QuickInfo, when the cursor is on a term
        "editor.quickInfo.delay": 500,

        "editor.completions.enabled": true,
        "editor.errors.slideOnFocus": true,
        "editor.formatting.formatOnSwitchToNormalMode": false, // TODO: Make this setting reliable. If formatting is slow, it will hose edits... not fun

        "editor.fontSize": "14px",
        // "editor.fontFamily" is platform-specific

        // Command to list files for 'quick open'
        // For example, to use 'ag': ag --nocolor -l .
        //
        // The command must emit a list of filenames
        //
        // IE, Windows:
        // "editor.quickOpen.execCommand": "dir /s /b"

        "editor.fullScreenOnStart" : false,

        "editor.cursorLine": true,
        "editor.cursorLineOpacity" : 0.1,

        "editor.cursorColumn": false,
        "editor.cursorColumnOpacity": 0.1,
    }

    private MacConfig: any = {
        "editor.fontFamily": "Monaco",
    }

    private WindowsConfig: any = {
        "editor.fontFamily": "Consolas",
    }

    private LinuxConfig: any = {
        "editor.fontFamily": "DejaVu Sans Mono",
    }

    private DefaultPlatformConfig = Platform.isWindows() ? this.WindowsConfig : Platform.isLinux() ? this.LinuxConfig : this.MacConfig

    private configChanged: EventEmitter = new EventEmitter()

    private Config: any = {}

    constructor() {
        super()

        Performance.mark("Config.load.start")

        this.applyConfig()
        // use watch() on the directory rather than on config.js because it watches
        // file references and changing a file in Vim typically saves a tmp file
        // then moves it over to the original filename, causing watch() to lose its
        // reference. Instead, watch() can watch the folder for the file changes
        // and continue to fire when file references are swapped out.
        // Unfortunately, this also means the 'change' event fires twice.
        // I could use watchFile() but that polls every 5 seconds.  Not ideal.
        fs.watch(this.getUserFolder(), (event, filename) => {
            if (event === "change" && filename === "config.js") {
                // invalidate the Config currently stored in cache
                delete global["require"].cache[global["require"].resolve(this.userJsConfig)] // tslint:disable-line no-string-literal
                this.applyConfig()
                this.notifyListeners()
            }
        })

        Performance.mark("Config.load.end")
    }

    public hasValue(configValue: string): boolean {
        return !!this.getValue<any>(configValue)
    }

    public getValue<T>(configValue: string): T {
        return this.Config[configValue]
    }

    public getUserFolder(): string {
        return path.join(Platform.getUserHome(), ".oni")
    }

    public registerListener(callback: Function): void {
        this.configChanged.on("config-change", callback)
    }

    public unregisterListener(callback: Function): void {
        this.configChanged.removeListener("config-change", callback)
    }

    private applyConfig(): void {
        let userRuntimeConfig = {}
        if (fs.existsSync(this.userJsConfig)) {
            try {
                userRuntimeConfig = global["require"](this.userJsConfig) // tslint:disable-line no-string-literal
            } catch (e) {
                // TODO: display this error to the user somehow
                console.log("Failed to parse " + this.userJsConfig + ": " + (<Error>e).message) // tslint:disable-line no-console
            }
        }
        this.Config = { ...this.DefaultConfig, ...this.DefaultPlatformConfig, ...userRuntimeConfig }
    }

    private notifyListeners(): void {
        this.configChanged.emit("config-change")
    }

}

const _config = new Config()
export const instance = () => _config
