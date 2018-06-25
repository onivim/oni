/**
 * TokenColors
 *
 * - Rationalizes colors from both the active theme and configuration
 * - The 'source of truth' for tokenColors in Oni
 * - Also will handle 'fallback logic' for tokenColors
 */

import { Event, IDisposable, IEvent } from "oni-types"

export interface TokenColor {
    scope: string
    settings: TokenColorStyle
}

export interface TokenColorStyle {
    foregroundColor: string
    backgroundColor: string

    bold: boolean
    italic: boolean
}

import { Configuration, IConfigurationValues } from "./Configuration"
import { ThemeManager } from "./Themes"

export class TokenColors implements IDisposable {
    private _subscriptions: IDisposable[] = []
    private _tokenColors: TokenColor[] = []
    private _onTokenColorsChangedEvent: Event<void> = new Event<void>(
        "TokenColors::onTokenColorsChangedEvent",
    )

    private _defaultTokenColors: TokenColor[] = []

    public get tokenColors(): TokenColor[] {
        return this._tokenColors
    }

    public get onTokenColorsChanged(): IEvent<void> {
        return this._onTokenColorsChangedEvent
    }

    constructor(private _configuration: Configuration, private _themeManager: ThemeManager) {
        const sub1 = this._themeManager.onThemeChanged.subscribe(() => {
            this._updateTokenColors()
        })

        const sub2 = this._configuration.onConfigurationChanged.subscribe(
            (newValues: Partial<IConfigurationValues>) => {
                if (newValues["editor.tokenColors"]) {
                    this._updateTokenColors()
                }
            },
        )

        this._subscriptions = [sub1, sub2]
    }

    public setDefaultTokenColors(tokenColors: TokenColor[]): void {
        this._defaultTokenColors = tokenColors || []
        this._updateTokenColors()
    }

    public dispose(): void {
        this._subscriptions.forEach(s => s.dispose())
        this._subscriptions = []
    }

    private _updateTokenColors(): void {
        const tokenColorsFromTheme = this._themeManager.activeTheme
            ? this._themeManager.activeTheme.tokenColors
            : []
        const userColors = this._configuration.getValue("editor.tokenColors")
        this._tokenColors = [
            ...(userColors || []),
            ...(tokenColorsFromTheme || []),
            ...this._defaultTokenColors,
        ]

        this._onTokenColorsChangedEvent.dispatch()
    }
}

let _tokenColors: TokenColors
export const activate = (configuration: Configuration, themeManager: ThemeManager) => {
    _tokenColors = new TokenColors(configuration, themeManager)
}

export const getInstance = () => {
    return _tokenColors
}
