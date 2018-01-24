/**
 * ThemePicker
 *
 * UI for showing available themes in a menu
 */

import { CallbackCommand, commandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { menuManager } from "./../Menu"
import { ThemeManager } from "./ThemeManager"

const chooseTheme = async (configuration: Configuration, themeManager: ThemeManager) => {
        const themes = await themeManager.getAllThemes()

        const items = themes.map((t) => ({
            icon: "paint",
            label: t.name,
            detail: t.path,
        }))

        const currentTheme = themeManager.activeTheme.name

        const themeMenu = menuManager.create()
        themeMenu.show()
        themeMenu.setItems(items)

        let wasSelected = false

        themeMenu.onItemSelected.subscribe(() => wasSelected = true)

        themeMenu.onHide.subscribe(() => {
            if (!wasSelected) {
                themeManager.setTheme(currentTheme)
            }
        })

        themeMenu.onSelectedItemChanged.subscribe((newOption) => {
            if (newOption) {
                configuration.setValues({"ui.colorscheme": newOption.label})
                themeManager.setTheme(newOption.label)
            } else {
                themeManager.setTheme(currentTheme)
            }
        })
}

export const activate = (configuration: Configuration, themeManager: ThemeManager) => {

    commandManager.registerCommand(
        new CallbackCommand(
            "oni.themes.choose",
            "Themes: Choose Theme",
            "Choose your theme from the available bundled themes.",
            () => chooseTheme(configuration, themeManager),
        ))
}
