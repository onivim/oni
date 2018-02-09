/**
 * TokenColors
 *
 * - Rationalizes colors from both the active theme and configuration
 * - The 'source of truth' for tokenColors in Oni
 * - Also will handle 'fallback logic' for tokenColors
 */

import { IDisposable, IEvent } from "oni-types"

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
    private _onTokenColorsChangedEvent: Event<void> = new Event<void>()

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

    public _updateTokenColors(): void {
        const tokenColorsFromTheme = this._themeManager.activeTheme
            ? this._themeManager.activeTheme.tokenColors
            : []
        const userColors = this._configuration.getValue("editor.tokenColors")
        this._tokenColors = [...(userColors || []), ...tokenColorsFromTheme]
    }
}

let _tokenColors: TokenColors
export const activate = (configuration: Configuration, themeManager: ThemeManager) => {
    _tokenColors = new TokenColors(configuration, themeManager)
}

export const getInstance = () => {
    return _tokenColors
}

export const VimHighlightToDefaultScope: { [key: string]: string[] } = {
    define: ["meta.import"],
    identifier: [
        "support.variable",
        "support.variable.property.dom",
        "variable.language",
        "variable.parameter",
        "variable.object",
        "meta.object.type",
        "meta.object",
    ],
    function: [
        "support.function",
        "entity.name",
        "entity.name.type.enum",
        "entity.name.type.interface",
        "meta.function.call",
        "meta.function",
        "punctuation.accessor",
        "punctuation.separator.continuation",
        "punctuation.separator.comma",
        "punctuation.terminator",
        "punctuation.terminator",
    ],
    constant: [
        "storage.type.interface",
        "storage.type.enum",
        "storage.type.interface",
        "entity.other",
        "keyword.control.import",
        "keyword.control",
        "variable.other.constant",
        "variable.other.object",
        "variable.other.property",
    ],
    type: [
        "meta.type.annotation",
        "meta.type.declaration",
        "meta.interface",
        "meta.class",
        "support.class.builtin",
        "support.type.primitive",
        "support.class",
        "variable.other.readwrite",
        "meta.namespace.declaration",
        "meta.namespace",
    ],
    normal: ["meta.brace.round"],
}
