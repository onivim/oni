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
    // private field for determining where a token came from
    _source?: string
}

export interface ThemeToken {
    scope: string | string[]
    settings: TokenColorStyle
}

export interface TokenColorStyle {
    foreground: string
    background: string

    fontStyle: "bold" | "italic" | "bold italic"
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

    private _flattenThemeTokens = (themeTokens: ThemeToken[] = []) => {
        const multidimensionalTokens = themeTokens.map(token => {
            if (Array.isArray(token.scope)) {
                return token.scope.map(s => ({
                    scope: s,
                    settings: token.settings,
                }))
            }
            return token
        })
        return [].concat(...multidimensionalTokens).filter(t => !!t.scope)
    }

    private _updateTokenColors(): void {
        const {
            "editor.tokenColors": tokenColorsFromTheme = [],
        } = this._themeManager.activeTheme.colors

        const themeTokens = this._flattenThemeTokens(tokenColorsFromTheme)
        const userColors = this._configuration.getValue("editor.tokenColors")

        this._tokenColors = this._mergeTokenColors({
            user: userColors,
            theme: themeTokens,
            defaults: this._defaultTokenColors,
        })

        this._onTokenColorsChangedEvent.dispatch()
    }

    /**
     * Merge different token source whilst unifying settings
     * each source is passed by name so that later the priority
     * for merging can be used e.g. if user source has a
     * a higher priority then conflicting settings can prefer the
     * user source
     */
    private _mergeTokenColors(tokens: {
        user: TokenColor[]
        defaults: TokenColor[]
        theme: TokenColor[]
    }) {
        return Object.keys(tokens).reduce(
            (output, key) => {
                const tokenColors: TokenColor[] = tokens[key]
                return tokenColors.reduce((mergedTokens, currentToken) => {
                    const duplicateToken = mergedTokens.find(t => currentToken.scope === t.scope)
                    if (duplicateToken) {
                        return mergedTokens.map(existingToken => {
                            if (existingToken.scope === duplicateToken.scope) {
                                return this._mergeSettings(existingToken, {
                                    ...currentToken,
                                    _source: key,
                                })
                            }
                            return existingToken
                        })
                    }
                    return [...mergedTokens, { ...currentToken, _source: key }]
                }, output)
            },
            [] as TokenColor[],
        )
    }

    private _mergeSettings(prev: TokenColor, next: TokenColor) {
        const priority = {
            user: 2,
            theme: 1,
            defaults: 0,
        }

        if (priority[next._source] > priority[prev._source]) {
            return {
                ...next,
                settings: {
                    ...prev.settings,
                    ...next.settings,
                },
            }
        }
        return {
            ...prev,
            settings: {
                ...next.settings,
                ...prev.settings,
            },
        }
    }
}

let _tokenColors: TokenColors
export const activate = (configuration: Configuration, themeManager: ThemeManager) => {
    _tokenColors = new TokenColors(configuration, themeManager)
}

export const getInstance = () => {
    return _tokenColors
}
