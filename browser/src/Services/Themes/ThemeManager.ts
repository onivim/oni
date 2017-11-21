/**
 * ThemeManager
 *
 * - Manages theming
 */

import { Event, IEvent } from "oni-types"

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

    "statusBar.background": string
    "statusBar.foreground": string

    "sidebar.background": string
    "sidebar.foreground": string

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
    return borderColor.rgb().toString()
}

export const getColorsFromForegroundAndBackground = (foreground: string, background: string) => {
    const borderColor = getBorderColor(background, foreground)
    return {
        ...DefaultThemeColors,
        "background": background,
        "foreground": foreground,
        "editor.background": background,
        "editor.foreground": foreground,

        "toolTip.background": background,
        "toolTip.foreground": foreground,
        "toolTip.border": borderColor,

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

const ColorBlack = "black"
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

    "sidebar.background": StatusBarBackground,
    "sidebar.foreground": StatusBarForeground,

    "fileExplorer.background": StatusBarBackground,
    "fileExplorer.foreground": StatusBarForeground,
    "fileExplorer.selection.background": NormalMode,
    "fileExplorer.selection.foreground": HighlightForeground,
    "fileExplorer.cursor.background": NormalMode,
    "fileExplorer.cursor.foreground": NormalMode,
}

export interface ITokenTheme {
    name: string
    scope: string[]
    settings: ITokenColorSettings
}

export interface ITokenColorSettings {
    background?: string
    foreground?: string

    bold: boolean
    italic: boolean
}

export interface IThemeMetadata {
    name: string
    baseVimTheme?: string
    colors: Partial<IThemeColors>
    tokenColors: ITokenTheme[]
}

export interface ITheme {
    getColor(color: keyof IThemeColors): void
    getTokenColor(scope: string): ITokenColorSettings
}

export class ThemeManager {
    private _onThemeChangedEvent: Event<ITheme> = new Event<ITheme>()

    public setTheme(name: string): void {

    }

    public get onThemeChanged(): IEvent<ITheme> {
        return this._onThemeChangedEvent
    }

    public getColors(): IThemeColors {
        return null
    }

    public getColor(color: keyof IThemeColors): string {
        return null
    }

    public getTokenColor(scope: string): ITokenColorSettings {
        return null
    }
}

