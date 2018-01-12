export * from "./ThemeManager"
import * as Shell from "./../../UI/Shell"

import { Configuration, IConfigurationValues } from "./../Configuration"
import { getThemeManagerInstance } from "./ThemeManager"

export const activate = async (configuration: Configuration): Promise<void> => {

    const updateColorScheme = async (configurationValues: Partial<IConfigurationValues>): Promise<void> => {
        const colorscheme = configurationValues["ui.colorscheme"]
        if (colorscheme) {
            const themeManager = getThemeManagerInstance()
            await themeManager.setTheme(colorscheme)
            Shell.Actions.setColors(themeManager.getColors())
        }
    }

    configuration.onConfigurationChanged.subscribe((newValues: Partial<IConfigurationValues>) => {
        updateColorScheme(newValues)
    })

    await updateColorScheme(configuration.getValues())
}
