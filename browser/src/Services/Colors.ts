/**
 * Colors
 *
 * - Rationalizes colors from both the active theme and configuration
 * - The 'source of truth' for colors in Oni
 * - Also will handle 'fallback logic' for colors
 */

import { Event, IDisposable, IEvent } from "oni-types"

import { configuration, Configuration, IConfigurationValues } from "./Configuration"
import { getThemeManagerInstance, ThemeManager } from "./Themes"

export interface ColorsDictionary { [colorName: string]: string}

export class Colors implements IDisposable {

    private _subscriptions: IDisposable[] = []
    private _colors: ColorsDictionary = {}
    private _onColorsChangedEvent: Event<void> = new Event<void>()

    public get onColorsChanged(): IEvent<void> {
        return this._onColorsChangedEvent
    }

    constructor(
        private _themeManager: ThemeManager = getThemeManagerInstance(),
        private _configuration: Configuration = configuration,
    ) {

        const sub1 = this._themeManager.onThemeChanged.subscribe(() => {
            this._updateColorsFromConfig()
        })

        const sub2 = this._configuration.onConfigurationChanged.subscribe((newValues: Partial<IConfigurationValues>) => {

            const anyColorsChanged = Object.keys(newValues).filter((color) => color.indexOf("colors.") >= 0)

            if (anyColorsChanged.length > 0) {
                this._updateColorsFromConfig()
            }
        })

        this._subscriptions = [sub1, sub2]
        this._updateColorsFromConfig()
    }

    public getColors(): ColorsDictionary {
        return this._colors
    }

    public getColor(colorName: string): string | null {
        return this._colors[colorName] || null
    }

    public dispose(): void {
        if (this._subscriptions && this._subscriptions.length) {
            this._subscriptions.forEach((disposable) => disposable.dispose())
            this._subscriptions = null
        }
    }

    private _updateColorsFromConfig(): void {

        if (!this._themeManager.activeTheme) {
            return
        }

        const currentThemeColors = this._themeManager.getColors()
        this._colors = {}

        Object.keys(currentThemeColors).forEach((themeColor) => {

            const configurationName = this._getConfigurationNameForColor(themeColor)

            const colorFromConfiguration = this._configuration.getValue(configurationName)

            this._colors[themeColor] = colorFromConfiguration ? colorFromConfiguration : currentThemeColors[themeColor]
        })

        this._onColorsChangedEvent.dispatch()
    }

    private _getConfigurationNameForColor(colorName: string): string {
        return "colors." + colorName
    }
}
