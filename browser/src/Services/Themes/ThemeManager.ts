/**
 * ThemeManager
 *
 * - Manages theming
 */

import { mergeWith } from "lodash"
import { Event, IEvent } from "oni-types"

import { IThemeContribution } from "./../../Plugins/Api/Capabilities"
import { PluginManager } from "./../../Plugins/PluginManager"

import {
    Configuration,
    configuration,
    GenericConfigurationValues,
    ITokenColorsSetting,
} from "./../Configuration"

import * as PersistentSettings from "./../Configuration/PersistentSettings"
import { IThemeLoader, PluginThemeLoader } from "./ThemeLoader"

interface IEditorTokens {
    [token: string]: ITokenColorsSetting
}

export interface IThemeColors {
    background: string
    foreground: string
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

    // User coloring options for the hover menu
    "editor.hover.title.background": string
    "editor.hover.title.foreground": string
    "editor.hover.border": string
    "editor.hover.contents.background": string
    "editor.hover.contents.foreground": string
    "editor.hover.contents.codeblock.background": string
    "editor.hover.contents.codeblock.foreground": string

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

    "editor.tokenColors": IEditorTokens

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

    const borderColor =
        backgroundColor.luminosity() > 0.5
            ? foregroundColor.lighten(0.6)
            : foregroundColor.darken(0.6)
    return borderColor.hex().toString()
}

export const getBackgroundColor = (editorBackground: string): string => {
    return Color(editorBackground)
        .darken(0.25)
        .hex()
        .toString()
}

const darken = (c: string, deg = 0.15) =>
    Color(c)
        .darken(0.15)
        .hex()
        .toString()
const alterColor = (c: string) => (Color(c).luminosity() > 0.5 ? darken(c) : darken(c, 0.6))

export const getHoverColors = (
    userConfig: GenericConfigurationValues,
    colors: Partial<IThemeColors>,
) => {
    const alteredBackground = alterColor(colors["toolTip.background"])
    const hoverDefaults = {
        "editor.hover.title.background": alteredBackground,
        "editor.hover.title.foreground": colors["toolTip.foreground"],
        "editor.hover.border": colors["toolTip.border"],
        "editor.hover.contents.background": alteredBackground,
        "editor.hover.contents.foreground": colors["toolTip.foreground"],
        "editor.hover.contents.codeblock.background": darken(alteredBackground, 0.25),
        "editor.hover.contents.codeblock.foreground": colors["toolTip.foreground"],
    }

    const userHoverColors = Object.keys(userConfig)
        .filter(value => value.includes("editor.hover"))
        .reduce((acc, val) => {
            if (userConfig[val]) {
                acc[val] = userConfig[val]
            }
            return acc
        }, hoverDefaults)
    return userHoverColors
}

// FIXME: Convert this fn to use below
const updateThemeWithDefaults = (tokenColors: Partial<IThemeColors>) => {
    const updatedTheme = Object.keys(tokenColors).reduce((acc, t) => {
        const item = tokenColors[t]
        if (item && !item.settings.foreground && item.settings.fallback) {
            acc[t] = {
                ...item,
                settings: {
                    ...item.settings,
                    ...tokenColors[item.settings.fallback.toLowerCase()].settings,
                },
            }
            return acc
        }
        return acc
    }, tokenColors)
    return { "editor.tokenColors": updatedTheme }
}

const getTokenColors = ({
    config,
    defaultTokens,
    themeColors,
    vimColors,
}: {
    config: Configuration
    defaultTokens: IEditorTokens
    themeColors: IEditorTokens
    vimColors: { [token: string]: ITokenColorsSetting }
}) => {
    const userTokens = config.getValue("editor.tokenColors")
    // Merge defaults, with vim sourced tokens, theme tokens and user selected
    // make sure never to override a truthy value with a falsy one
    const userCombined = mergeWith(
        defaultTokens,
        vimColors,
        themeColors,
        userTokens,
        (objValue, srcValue) => {
            if (objValue && !srcValue) {
                return objValue
            } else if (srcValue && !objValue) {
                return srcValue
            }
        },
    )

    // for (const token in userCombined) {
    //     if (userCombined.hasOwnProperty(token)) {
    //         const tokenObject = userCombined[token]
    //         if (!tokenObject.color && tokenObject.settings) {
    //             tokenObject.color = userCombined[tokenObject.settings.toLowerCase()].color
    //         }
    //     }
    // }
    const tokens = updateThemeWithDefaults(userTokens)
    const updatedTokens = { ...userCombined, ...tokens }
    return updatedTokens
}

export const getColorsFromConfig = ({
    config,
    vimColors,
    defaultTheme,
    themeColors,
}: {
    config: Configuration
    themeColors: Partial<IThemeColors>
    vimColors: { [token: string]: ITokenColorsSetting }
    defaultTheme: IThemeColors
}) => {
    const userConfig = config.getValues()
    const hoverColors = getHoverColors(userConfig, themeColors)
    const editorTokenColors = getTokenColors({
        config,
        defaultTokens: defaultTheme["editor.tokenColors"],
        themeColors: themeColors["editor.tokenColors"],
        vimColors,
    })

    return { ...hoverColors, "editor.tokenColors": editorTokenColors }
}

export const getColorsFromBackgroundAndForeground = (background: string, foreground: string) => {
    const shellBackground = getBackgroundColor(background)
    const borderColor = getBorderColor(background, foreground)
    return {
        ...DefaultThemeColors,
        background: shellBackground,
        foreground,
        "editor.background": background,
        "editor.foreground": foreground,

        "toolTip.background": background,
        "toolTip.foreground": foreground,
        "toolTip.border": borderColor,

        "editor.hover.title.background": background,
        "editor.hover.title.foreground": foreground,
        "editor.hover.border": borderColor,
        "editor.hover.contents.background": background,
        "editor.hover.contents.foreground": foreground,

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
    background: ColorBlack,
    foreground: ColorWhite,

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

    "editor.hover.title.background": ColorBlack,
    "editor.hover.title.foreground": ColorWhite,
    "editor.hover.border": ColorWhite,
    "editor.hover.contents.background": ColorBlack,
    "editor.hover.contents.foreground": ColorWhite,
    "editor.hover.contents.codeblock.background": ColorBlack,
    "editor.hover.contents.codeblock.foreground": ColorWhite,

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

    "editor.tokenColors": {
        "variable.object": {
            settings: {
                fallback: "identifier",
                bold: null,
                foreground: null,
                background: null,
                italic: null,
            },
            scope: "variable.object",
        },
        "variable.other.constant": {
            settings: {
                fallback: "constant",
                bold: null,
                foreground: null,
                background: null,
                italic: null,
            },
            scope: "variable.other.constant",
        },
        "variable.language": {
            settings: {
                fallback: "identifier",
                bold: null,
                foreground: null,
                background: null,
                italic: null,
            },
            scope: "variable.language",
        },
        "variable.parameter": {
            settings: {
                fallback: "identifier",
                bold: null,
                foreground: null,
                background: null,
                italic: null,
            },
            scope: "variable.parameter",
        },
        "variable.other": {
            settings: {
                fallback: "identifier",
                bold: null,
                foreground: null,
                background: null,
                italic: null,
            },
            scope: "variable.other",
        },
        "support.function": {
            scope: "support.function",
            settings: {
                fallback: "function",
                bold: null,
                foreground: null,
                background: null,
                italic: null,
            },
        },
        "entity.name": {
            scope: "entity.name",
            settings: {
                fallback: "function",
                bold: null,
                foreground: null,
                background: null,
                italic: null,
            },
        },
        "entity.other": {
            scope: "entity.other",
            settings: {
                fallback: "constant",
                bold: null,
                foreground: null,
                background: null,
                italic: null,
            },
        },
    },
}

// export interface ITokenTheme {
//     name: string
//     settings: ITokenColorSettings
// }

export interface IThemeMetadata {
    name: string
    baseVimTheme?: string
    colors: Partial<IThemeColors>
}

export const DefaultTheme: IThemeMetadata = {
    name: "default",
    baseVimTheme: "default",
    colors: DefaultThemeColors,
}

export class ThemeManager {
    private _onThemeChangedEvent: Event<void> = new Event<void>()

    private _activeTheme: IThemeMetadata = DefaultTheme
    private _vimHighlights: { [token: string]: ITokenColorsSetting } = {}

    private _isAnonymousTheme: boolean = false

    // _colors stores the current theme colors mixed with configuration
    private _colors: IThemeColors = DefaultThemeColors

    public get activeTheme(): IThemeMetadata {
        return this._activeTheme
    }

    constructor(private _themeLoader: IThemeLoader) {}

    public async getAllThemes(): Promise<IThemeContribution[]> {
        return this._themeLoader.getAllThemes()
    }

    public async setVimHighlightColors(tokenColors: ITokenColorsSetting[]) {
        const tokens = tokenColors.reduce((acc, t) => {
            acc[t.scope.toLowerCase()] = t
            return acc
        }, this._vimHighlights)
        this._vimHighlights = tokens
        this._updateTheme(this._activeTheme)
    }

    public async setTheme(name: string): Promise<void> {
        // TODO: Load theme...
        if (!name || name === this._activeTheme.name) {
            return
        }

        const theme = await this._themeLoader.getThemeByName(name)

        if (!theme) {
            // If we couldn't find the theme... we'll try
            // loading vim-style, and derive a theme from
            // that.
            this._isAnonymousTheme = true

            const temporaryVimTheme = {
                name,
                baseVimTheme: name,
                colors: DefaultThemeColors,
                tokenColors: this._vimHighlights,
            }

            this._updateTheme(temporaryVimTheme)
        } else {
            this._updateTheme(theme)
        }
    }

    public async notifyVimThemeChanged(
        vimName: string,
        backgroundColor: string,
        foregroundColor: string,
    ): Promise<void> {
        // If the vim colorscheme changed, for example, via `:co <sometheme>`,
        // then we should update our theme to match
        if (
            this._isAnonymousTheme ||
            (this._activeTheme.baseVimTheme &&
                this._activeTheme.baseVimTheme !== vimName &&
                this._activeTheme.baseVimTheme !== "*")
        ) {
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

        const userColors = getColorsFromConfig({
            config: configuration,
            defaultTheme: DefaultThemeColors,
            themeColors: this.activeTheme.colors,
            vimColors: this._vimHighlights,
        })

        this._colors = {
            ...DefaultThemeColors,
            ...this._activeTheme.colors,
            ...userColors,
        }

        this._onThemeChangedEvent.dispatch()
    }
}

let _themeManager: ThemeManager = null
export const activateThemes = (pluginManager: PluginManager): void => {
    const loader = new PluginThemeLoader(pluginManager)
    _themeManager = new ThemeManager(loader)
}

export const getThemeManagerInstance = () => {
    return _themeManager
}
