/**
 * ThemeManager
 *
 * - Manages theming
 */

import { Event, IEvent } from "oni-types"

import * as PersistentSettings from "./../Configuration/PersistentSettings"
import { PluginThemeLoader } from "./ThemeLoader"

export interface IThemeColors {
    "background": string
    "foreground": string
    "editor.background": string
    "editor.foreground": string

    "highlight.mode.insert.foreground": string
    "highlight.mode.insert.background": string

    "highlight.mode.normal.foreground": string
    "highlight.mode.normal.background": string

    "highlight.mode.visual.foreground": string
    "highlight.mode.visual.background": string

    "highlight.mode.operator.foreground": string
    "highlight.mode.operator.background": string

    "tabs.background": string
    "tabs.foreground": string

    // Tool tip is used for some contextual information,
    // like hover, as well as for rename.
    "toolTip.background": string
    "toolTip.foreground": string
    "toolTip.border": string

    // Context menu is used for completion, refactoring
    "contextMenu.background": string
    "contextMenu.foreground": string
    "contextMenu.border": string
    "contextMenu.highlight": string

    // Menu is used for the popup menu
    "menu.background": string
    "menu.foreground": string
    "menu.border": string
    "menu.highlight": string

    "sidebar.background": string
    "sidebar.foreground": string
    "sidebar.active.background": string
    "sidebar.selection.border": string

    "statusBar.background": string
    "statusBar.foreground": string

    "title.background": string
    "title.foreground": string

    "fileExplorer.background": string
    "fileExplorer.foreground": string
    "fileExplorer.selection.background": string
    "fileExplorer.selection.foreground": string
    "fileExplorer.cursor.background": string
    "fileExplorer.cursor.foreground": string

    // LATER:
    //  - Notifications?
    //  - Alert / message?
}

import * as Color from "color"

/**
 * Gets a reasonable border color for popup elements, based on popups
 */
export const getBorderColor = (bgColor: string, fgColor: string): string => {
    const backgroundColor = Color(bgColor)
    const foregroundColor = Color(fgColor)

    const borderColor = backgroundColor.luminosity() > 0.5 ? foregroundColor.lighten(0.6) : foregroundColor.darken(0.6)
    return borderColor.hex().toString()
}

export const getBackgroundColor = (editorBackground: string): string => {
    return Color(editorBackground).darken(0.25).hex().toString()
}

export const getColorsFromBackgroundAndForeground = (background: string, foreground: string) => {
    const shellBackground = getBackgroundColor(background)
    const borderColor = getBorderColor(background, foreground)
    return {
        ...DefaultThemeColors,
        "background": shellBackground,
        "foreground": foreground,
        "editor.background": background,
        "editor.foreground": foreground,

        "toolTip.background": background,
        "toolTip.foreground": foreground,
        "toolTip.border": borderColor,

        "sidebar.background": shellBackground,
        "sidebar.foreground": foreground,
        "sidebar.active.background": background,
        "sidebar.selection.border": borderColor,

        "tabs.background": background,
        "tabs.foreground": foreground,

        "title.background": shellBackground,
        "title.foreground": foreground,

        // Context menu is used for completion, refactoring
        "contextMenu.background": background,
        "contextMenu.foreground": foreground,
        "contextMenu.border": borderColor,
        "contextMenu.highlight": borderColor,

        // Menu is used for the popup menu
        "menu.background": background,
        "menu.foreground": foreground,
        "menu.border": borderColor,
    }
}

const ColorBlack = (PersistentSettings.get("_internal.lastBackgroundColor") as string) || "#1E2127"
const ColorWhite = "white"

const InsertMode = "#00c864"
const OperatorMode = "#ff6400"
const NormalMode = "#0064ff"

const HighlightForeground = "#dcdcdc"

const StatusBarBackground = "#282828"
const StatusBarForeground = "#c8c8c8"

export const DefaultThemeColors: IThemeColors = {
    "background": ColorBlack,
    "foreground": ColorWhite,

    "editor.background": ColorBlack,
    "editor.foreground": ColorWhite,

    "title.background": ColorBlack,
    "title.foreground": ColorWhite,

    "highlight.mode.insert.foreground": HighlightForeground,
    "highlight.mode.insert.background": InsertMode,

    "highlight.mode.normal.foreground": HighlightForeground,
    "highlight.mode.normal.background": NormalMode,

    "highlight.mode.visual.foreground": HighlightForeground,
    "highlight.mode.visual.background": NormalMode,

    "highlight.mode.operator.foreground": HighlightForeground,
    "highlight.mode.operator.background": OperatorMode,

    // Tool tip is used for some contextual information,
    // like hover, as well as for rename.
    "toolTip.background": ColorBlack,
    "toolTip.foreground": ColorWhite,
    "toolTip.border": ColorWhite,

    // Context menu is used for completion, refactoring
    "contextMenu.background": ColorBlack,
    "contextMenu.foreground": ColorBlack,
    "contextMenu.border": ColorWhite,
    "contextMenu.highlight": ColorBlack,

    // Menu is used for the popup menu
    "menu.background": ColorBlack,
    "menu.foreground": ColorBlack,
    "menu.border": ColorWhite,
    "menu.highlight": ColorBlack,

    "statusBar.background": StatusBarBackground,
    "statusBar.foreground": StatusBarForeground,

    "sidebar.background": ColorBlack,
    "sidebar.foreground": ColorWhite,
    "sidebar.active.background": ColorBlack,
    "sidebar.selection.border": ColorWhite,

    "tabs.background": ColorBlack,
    "tabs.foreground": ColorWhite,

    "fileExplorer.background": StatusBarBackground,
    "fileExplorer.foreground": StatusBarForeground,
    "fileExplorer.selection.background": NormalMode,
    "fileExplorer.selection.foreground": HighlightForeground,
    "fileExplorer.cursor.background": NormalMode,
    "fileExplorer.cursor.foreground": NormalMode,
}

// export interface ITokenTheme {
//     name: string
//     scope: string[]
//     settings: ITokenColorSettings
// }

// export interface ITokenColorSettings {
//     background?: string
//     foreground?: string

//     bold: boolean
//     italic: boolean
// }

export interface IThemeMetadata {
    name: string
    baseVimTheme?: string
    colors: Partial<IThemeColors>
    // tokenColors: ITokenTheme[]
}

export const DefaultTheme: IThemeMetadata = {
    name: "default",
    baseVimTheme: "default",
    colors: DefaultThemeColors,
    // tokenColors: [],
}

export class ThemeManager {
    private _onThemeChangedEvent: Event<void> = new Event<void>()

    private _activeTheme: IThemeMetadata = DefaultTheme

    private _isAnonymousTheme: boolean = false

    // _colors stores the current theme colors mixed with configuration
    private _colors: IThemeColors = DefaultThemeColors

    public get activeTheme(): IThemeMetadata {
        return this._activeTheme
    }

    public async setTheme(name: string): Promise<void> {
        // TODO: Load theme...
        if (!name || name === this._activeTheme.name) {
            return
        }

        const themeLoader = new PluginThemeLoader()

        const theme = await themeLoader.getThemeByName(name)

        if (!theme) {
            // If we couldn't find the theme... we'll try
            // loading vim-style, and derive a theme from
            // that.
            this._isAnonymousTheme = true

            const temporaryVimTheme = {
                name,
                baseVimTheme: name,
                colors: DefaultThemeColors,
            }

            this._updateTheme(temporaryVimTheme)
        } else {
            this._updateTheme(theme)
        }
    }

    public notifyVimThemeChanged(vimName: string, backgroundColor: string, foregroundColor: string): void {

        // If the vim colorscheme changed, for example, via `:co <sometheme>`,
        // then we should update our theme to match
        if (this._isAnonymousTheme || (this._activeTheme.baseVimTheme && this._activeTheme.baseVimTheme !== vimName && this._activeTheme.baseVimTheme !== "*")) {
            this._isAnonymousTheme = false

            const vimTheme: IThemeMetadata = {
                name: vimName,
                baseVimTheme: vimName,
                colors: getColorsFromBackgroundAndForeground(backgroundColor, foregroundColor),
            }

            this._updateTheme(vimTheme)
        }
    }

    public get onThemeChanged(): IEvent<void> {
        return this._onThemeChangedEvent
    }

    public getColors(): IThemeColors {
        return this._colors
    }

    private _updateTheme(theme: IThemeMetadata): void {
        this._activeTheme = theme

        this._colors = {
            ...DefaultThemeColors,
            ...this._activeTheme.colors,
        }

        this._onThemeChangedEvent.dispatch()
    }
}

let _themeManager: ThemeManager = null
export const getThemeManagerInstance = () => {
    if (!_themeManager) {
        _themeManager = new ThemeManager()
    }

    return _themeManager
}
