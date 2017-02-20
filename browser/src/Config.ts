import * as fs from "fs"
import * as path from "path"

import * as Performance from "./Performance"
import * as Platform from "./Platform"

export const FallbackFonts = "Consolas,Monaco,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace"

const DefaultConfig: any = {
    // Debug settings
    "debug.incrementalRenderRegions": false,

    // Prototype settings
    "prototype.editor.backgroundOpacity": 0.7,
    "prototype.editor.backgroundImageUrl": "images/background.png",
    "prototype.editor.backgroundImageSize": "initial",

    "prototype.editor.maxCellsToRender": 12000,

    // Bell sound effect to use
    // See `:help bell` for instances where the bell sound would be used
    "oni.audio.bellUrl": path.join(__dirname, "audio", "beep.wav"),

    // Production settings

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

    "editor.fontSize": "14px",
    "editor.quickInfo.enabled": true,

    // Delay (in ms) for showing QuickInfo, when the cursor is on a term
    "editor.quickInfo.delay": 500,

    "editor.completions.enabled": true,
    "editor.errors.slideOnFocus": true,
    "editor.formatting.formatOnSwitchToNormalMode": false, // TODO: Make this setting reliable. If formatting is slow, it will hose edits... not fun

    // Command to list files for 'quick open'
    // For example, to use 'ag': ag --nocolor -l .
    //
    // The command must emit a list of filenames
    //
    // IE, Windows:
    // "editor.quickOpen.execCommand": "dir /s /b"
    "editor.fullScreenOnStart" : false,

    "editor.cursorLine": true,
    "editor.cursorColumn": false,
}

const MacConfig: any = {
    "editor.fontFamily": "Monaco",
}

const WindowsConfig: any = {
    "editor.fontFamily": "Consolas",
}

const LinuxConfig: any = {
    "editor.fontFamily": "DejaVu Sans Mono",
}

const DefaultPlatformConfig = Platform.isWindows() ? WindowsConfig : Platform.isLinux() ? LinuxConfig : MacConfig

Performance.mark("Config.load.start")

const userConfigFile = path.join(getUserFolder(), "config.json")
const userJsConfig = path.join(getUserFolder(), "config.js")

let userConfig = {}
if (fs.existsSync(userConfigFile)) {
    userConfig = JSON.parse(fs.readFileSync(userConfigFile, "utf8"))
}

let userRuntimeConfig = {}
if (fs.existsSync(userJsConfig)) {
    userRuntimeConfig = global["require"](userJsConfig) // tslint:disable-line no-string-literal
}

const Config = { ...DefaultConfig, ...DefaultPlatformConfig, ...userConfig, ...userRuntimeConfig }
Performance.mark("Config.load.end")

export function hasValue(configValue: string): boolean {
    return !!getValue<any>(configValue)
}

export function getValue<T>(configValue: string): T {
    return Config[configValue]
}

export function getUserFolder(): string {
    return path.join(Platform.getUserHome(), ".oni")
}
