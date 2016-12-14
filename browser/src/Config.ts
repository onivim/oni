import * as fs from "fs"
import * as path from "path"
import * as Platform from "./Platform"

export const FallbackFonts = "Consolas,Monaco,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace"

const DefaultConfig: any = {
    // Debug settings
    "debug.incrementalRenderRegions": false,

    // Prototype settings
    "prototype.editor.backgroundOpacity": 1,
    "prototype.editor.backgroundImageUrl": null,
    "prototype.editor.backgroundImageSize": null,

    "prototype.editor.maxCellsToRender": 12000,

    // Production settings

    // The default config is an opinionated, prescribed set of plugins. This is on by default to provide
    // a good out-of-box experience, but will likely conflict with a Vim/Neovim veteran's finely honed config. 
    //
    // Set this to 'false' to avoid loading the default config, and load settings from init.vim instead.
    "oni.useDefaultConfig": true,

    "editor.fontSize": "14px",
    "editor.quickInfo.enabled": true,
    "editor.completions.enabled": true,
    "editor.errors.slideOnFocus": true,
    "editor.formatting.formatOnSwitchToNormalMode": false, // TODO: Make this setting reliable. If formatting is slow, it will hose edits... not fun

    // Command to list files for 'quick open'
    // For example, to use 'ag': ag --nocolor -l ${searchText}
    //
    // The command must emit a list of filenames
    // "editor.quickOpen.execCommand": "ag --nocolor -l ${searchText}"
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

const userConfigFile = path.join(Platform.getUserHome(), ".oni", "config.json")

let userConfig = {}

if (fs.existsSync(userConfigFile)) {
    userConfig = JSON.parse(fs.readFileSync(userConfigFile, "utf8"))
}

const Config = { ...DefaultConfig, ...DefaultPlatformConfig, ...userConfig }

export function hasValue(configValue: string): boolean {
    return !!getValue<any>(configValue)
}

export function getValue<T>(configValue: string): T {
    return Config[configValue]
}
