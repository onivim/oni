import * as path from "path"
import * as fs from "fs"

import * as Platform from "./Platform"

const DefaultConfig: any = {
    // Debug settings
    "debug.incrementalRenderRegions": false,

    // Prototype settings
    "prototype.editor.backgroundOpacity": 0.9,
    "prototype.editor.backgroundImageUrl": "http://cdn.wonderfulengineering.com/wp-content/uploads/2014/04/code-wallpaper-2.jpg",
    "prototype.editor.backgroundImageSize": "cover",

    "prototype.editor.maxCellsToRender": 12000,

    // Production settings
    "oni.loadPlugins": true,

    "editor.fontSize": "14px",
    "editor.quickInfo.enabled": true,
    "editor.completions.enabled": true,
    "editor.errors.slideOnFocus": true,
    "editor.formatting.formatOnSwitchToNormalMode": false, // TODO: Make this setting reliable. If formatting is slow, it will hose edits... not fun
}

const MacConfig: any = {
    "editor.fontFamily": "Monaco"
}

const WindowsConfig: any = {
    "editor.fontFamily": "Consolas"
}

const DefaultPlatformConfig = Platform.isMac() ? MacConfig : WindowsConfig

const userConfigFile = path.join(Platform.getUserHome(), ".oni", "config.json")

let userConfig = {}

if (fs.existsSync(userConfigFile)) {
    userConfig = JSON.parse(fs.readFileSync(userConfigFile, "utf8"))
}

const Config = Object.assign({}, DefaultConfig, DefaultPlatformConfig, userConfig);

export function hasValue(configValue: string): boolean {
    return !!getValue<any>(configValue)
}

export function getValue<T>(configValue: string): T {
    return Config[configValue]
}
