/**
 * PluginConfigurationSynchronizer.ts
 *
 * Responsible for synchronizing user's `plugin` configuration settings.
 */

import { Configuration } from "./../Services/Configuration"
import { PluginManager } from "./PluginManager"

export const activate = (configuration: Configuration, pluginManager: PluginManager): void => {
    const setting = configuration.registerSetting<string[]>("plugins", {
        description:
            "`plugins` is an array of strings designating plugins that should be installed. Plugins can either be installed from `npm` (for Oni / JS plugins), or from GitHub (usually for Vim plugins). For an `npm` plugin, simply specify the package name - like 'oni-power-mode'. For a GitHub plugin, specify the user + plugin, for example 'tpope/vim-fugitive'",
        requiresReload: false,
    })

    setting.onValueChanged.subscribe(evt => {
        console.dir(`'plugins changed' - new value: ${evt.newValue} old value: ${evt.oldValue}`)
    })
}
