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

    "statusbar.background": string
    "statusbar.foreground": string

    "sidebar.background": string
    "sidebar.foreground": string

    "fileExplorer.background": string
    "fileExplorer.foreground": string
    "fileExplorer.selection.background": string
    "fileExplorer.selection.foreground": string
    "fileExplorer.cursor.background": string
    "fileExplorer.cursor.foreground": string

    // TODO: Quick info?
    // TODO: Context menu
    // TODO: Menu
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

    public get onThemeChanged(): IEvent<ITheme> {
        return this._onThemeChangedEvent
    }

}

