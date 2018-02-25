/**
 * TokenColors
 *
 * - Rationalizes colors from both the active theme and configuration
 * - The 'source of truth' for tokenColors in Oni
 * - Also will handle 'fallback logic' for tokenColors
 */

import { isEqual, unionWith } from "lodash"
import { Event, IDisposable, IEvent } from "oni-types"

export interface TokenColor {
    scope: string
    settings: TokenColorStyle
}

export interface ThemeToken {
    scope: string | string[]
    settings: {
        foreground?: string
        background?: string
        fontStyle?: "bold" | "italic"
    }
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
    private _onTokenColorsChangedEvent: Event<void> = new Event<void>()

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

    private _flattenThemeTokens = (themeTokens: ThemeToken[]) => {
        const multidimensionalTokens = themeTokens.map(
            token =>
                Array.isArray(token.scope)
                    ? token.scope.map(s => ({
                          scope: s,
                          settings: this._formatThemeTokens(token),
                      }))
                    : { scope: token.scope, settings: this._formatThemeTokens(token) },
        )
        return [].concat(...multidimensionalTokens).filter(t => !!t.scope)
    }

    private _formatThemeTokens = ({
        settings: { foreground, background, fontStyle },
    }: ThemeToken) => ({
        foregroundColor: foreground,
        backgroundColor: background,
        italic: fontStyle === "italic",
        bold: fontStyle === "bold",
    })

    private _updateTokenColors(): void {
        const {
            "editor.tokenColors": tokenColorsFromTheme = [],
        } = this._themeManager.activeTheme.colors
        const themeTokens = this._flattenThemeTokens(tokenColorsFromTheme)
        const userColors = this._configuration.getValue("editor.tokenColors")
        // this._tokenColors = [
        //     ...(userColors || []),
        //     ...(tokenColorsFromTheme || []),
        //     ...this._defaultTokenColors,
        // ]

        console.log(
            "this._mergeTokenColors: ",
            (this._tokenColors = this._mergeTokenColors({
                user: userColors,
                theme: themeTokens,
                defaultTokens: this._defaultTokenColors,
            })),
        )

        this._onTokenColorsChangedEvent.dispatch()
    }

    private _mergeTokenColors({ user, defaultTokens, theme }: { [key: string]: TokenColor[] }) {
        const defaultAndTheme = unionWith(defaultTokens, theme, isEqual)
        const userAndTheme = unionWith(user, defaultAndTheme, isEqual)
        return userAndTheme
    }
}

let _tokenColors: TokenColors
export const activate = (configuration: Configuration, themeManager: ThemeManager) => {
    _tokenColors = new TokenColors(configuration, themeManager)
}

export const getInstance = () => {
    return _tokenColors
}
