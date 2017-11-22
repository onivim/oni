export * from "./ThemeManager"

import { Configuration, IConfigurationValues } from "./../Configuration"
import { getThemeManagerInstance } from "./ThemeManager"

export const activate = (configuration: Configuration) => {

    const updateColorScheme = (configurationValues: Partial<IConfigurationValues>) => {
        const colorscheme = configurationValues["ui.colorscheme"]
        if (colorscheme) {
            const themeManager = getThemeManagerInstance()
            themeManager.setTheme(colorscheme)
        }
    }

    configuration.onConfigurationChanged.subscribe((newValues: Partial<IConfigurationValues>) => {
        updateColorScheme(newValues)
    })

    updateColorScheme(configuration.getValues())
}
