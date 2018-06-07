/**
 * PluginConfigurationSynchronizer.ts
 *
 * Responsible for synchronizing user's `plugin` configuration settings.
 */

import * as Log from "oni-core-logging"

import { Configuration } from "./../Services/Configuration"
import { PluginManager } from "./PluginManager"

export const activate = (configuration: Configuration, pluginManager: PluginManager): void => {
    const setting = configuration.registerSetting<string[]>("plugins", {
        description:
            "`plugins` is an array of strings designating plugins that should be installed. Plugins can either be installed from `npm` (for Oni / JS plugins), or from GitHub (usually for Vim plugins). For an `npm` plugin, simply specify the package name - like 'oni-power-mode'. For a GitHub plugin, specify the user + plugin, for example 'tpope/vim-fugitive'",
        requiresReload: false,
    })

    setting.onValueChanged.subscribe(evt => {
        if (!evt.newValue || !evt.newValue.length) {
            return
        }

        Log.verbose("[PluginConfigurationSynchronizer - onValueChanged]")

        const newPlugins = evt.newValue.filter(plugin => evt.oldValue.indexOf(plugin) === -1)

        Log.info("[PluginConfigurationSynchronizer] New Plugins: " + newPlugins)

        newPlugins.forEach(async plugin => {
            Log.info("[PluginConfigurationSynchronizer] Installing plugin: " + plugin)
            await pluginManager.installer.install(plugin)
            Log.info("[PluginConfigurationSynchronizer] Installation complete!")
        })
    })
}
