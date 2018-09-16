/**
 * TokenColors
 *
 * - Rationalizes colors from both the active theme and configuration
 * - The 'source of truth' for tokenColors in Oni
 * - Also will handle 'fallback logic' for tokenColors
 */

import { Event, IDisposable, IEvent } from "oni-types"

import { Configuration, IConfigurationValues } from "./Configuration"
import { ThemeManager } from "./Themes"

export interface TokenColor {
    scope: string[]
    settings: TokenColorStyle
    // private field for determining where a token came from
    _source?: string
}

export interface ThemeToken {
    scope: string | string[]
    settings: TokenColorStyle
    _source?: string
}

export interface TokenColorStyle {
    foreground: string
    background: string

    fontStyle: "bold" | "italic" | "bold italic"
}

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

    private _updateTokenColors(): void {
        const {
            activeTheme: {
                colors: { "editor.tokenColors": themeTokens = [] },
            },
        } = this._themeManager

        const userColors = this._configuration.getValue("editor.tokenColors")

        const combinedColors = this._mergeTokenColors({
            user: userColors,
            theme: themeTokens,
            defaults: this._defaultTokenColors,
        })

        this._tokenColors = this._convertThemeTokenScopes(combinedColors)

        this._onTokenColorsChangedEvent.dispatch()
    }

    /**
     * Theme tokens can pass in token scopes as a string or an array
     * this converts all token scopes passed in to an array of strings
     *
     * @name convertThemeTokenScopes
     * @function
     * @param {ThemeToken[]} tokens
     * @returns {TokenColor[]}
     */
    private _convertThemeTokenScopes(tokens: ThemeToken[]) {
        return tokens.map(token => {
            const scope = !token.scope
                ? []
                : Array.isArray(token.scope)
                    ? token.scope
                    : token.scope.split(" ")
            return { ...token, scope }
        })
    }

    /**
     * Merge different token source whilst unifying settings
     * each source is passed by name so that later the priority
     * for merging can be used e.g. if user source has a
     * a higher priority then conflicting settings can prefer the
     * user source
     */
    private _mergeTokenColors(tokens: {
        user: ThemeToken[]
        defaults: TokenColor[]
        theme: ThemeToken[]
    }) {
        return Object.entries(tokens).reduce<ThemeToken[]>(
            (output, [_source, tokenColors]) =>
                tokenColors.reduce((mergedTokens, currentToken) => {
                    const duplicateToken = mergedTokens.find(t => currentToken.scope === t.scope)
                    if (duplicateToken) {
                        return mergedTokens.map(existingToken => {
                            if (existingToken.scope === duplicateToken.scope) {
                                return this._mergeSettings(existingToken, {
                                    ...currentToken,
                                    _source,
                                })
                            }
                            return existingToken
                        })
                    }
                    return [...mergedTokens, { ...currentToken, _source }]
                }, output),
            [],
        )
    }

    private _mergeSettings(prev: ThemeToken, next: ThemeToken) {
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
