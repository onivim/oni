import * as os from "os"

const DefaultConfig: any = {
    // "debug.fixedSize": { rows: 10, columns: 100 }
    "debug.incrementalRenderRegions": false,

    // Experimental background settings
    "prototype.editor.backgroundOpacity": 1,

    /*
    "prototype.editor.backgroundOpacity": 0.9,
    "prototype.editor.backgroundImageUrl": "http://cdn.wonderfulengineering.com/wp-content/uploads/2014/04/code-wallpaper-2.jpg",
    "prototype.editor.backgroundImageSize": "cover",
    */

    "oni.loadPlugins": true,

    "editor.fontSize": "14px",
    "editor.quickInfo.enabled": true,
    "editor.completions.enabled": true,
    "editor.errors.slideOnFocus": true,

}

const MacConfig: any = {
    "editor.fontFamily": "Monaco"
}

const WindowsConfig: any = {
    "editor.fontFamily": "Consolas"
}

const isMac = os.platform() === "darwin"

const DefaultPlatformConfig = isMac ? MacConfig : WindowsConfig

const Config = Object.assign({}, DefaultConfig, DefaultPlatformConfig);

export function hasValue(configValue: string): boolean {
    return !!getValue<any>(configValue)
}

export function getValue<T>(configValue: string): T {
    return Config[configValue]
}
