/**
 * ThemePicker
 *
 * UI for showing available themes in a menu
 */

import { CallbackCommand, commandManager } from "./../CommandManager"
import { menuManager } from "./../Menu"
import { ThemeManager } from "./ThemeManager"

export const activate = (themeManager: ThemeManager) => {

    commandManager.registerCommand(
        new CallbackCommand(
            "oni.themes.pick",
            "Themes: Choose theme",
            null,
            async () => {

                const themes = await themeManager.getAllThemes()

                const items = themes.map((t) => ({
                    icon: null,
                    label: t.name,
                    detail: t.path,
                }))

                const themeMenu = menuManager.create()
                themeMenu.show()
                themeMenu.setItems(items)
            }
        ))
}

