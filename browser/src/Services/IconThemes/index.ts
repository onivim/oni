/**
 * Icons
 *
 * - Data source for icons present in Oni
 * - Loads icons based on the `ui.iconTheme` configuration setting
 */
export * from "./Icons"

import { PluginManager } from "./../../Plugins/PluginManager"

import { Configuration } from "./../Configuration"

import { Icons } from "./Icons"

let _icons: Icons = null

export const getInstance = (): Icons => {
    return _icons
}

export const activate = async (
    configuration: Configuration,
    pluginManager: PluginManager,
): Promise<void> => {
    _icons = new Icons(pluginManager)

    const iconTheme = configuration.getValue("ui.iconTheme")
    await _icons.applyIconTheme(iconTheme)
}
