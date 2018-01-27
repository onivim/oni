/**
 * VimConfigurationSynchronizer
 *
 * Helper method to synchronize configuration settings of the form:
 * `vim.globals.xxxx`
 *  Ex: vim.globals.python_host_prog
 * `vim.setting.xxxx`
 */

import { INeovimInstance } from "./../neovim/NeovimInstance"

export interface IConfigurationValues {
    [key: string]: any
}

const vimGlobalPrefix = "vim.global."
const vimSettingPrefix = "vim.setting."

// TODO:
// - `onConfigChanged` with updated values
// - Handle initial load case
// - Update documentation / default config
export const synchronizeConfiguration = (
    neovimInstance: INeovimInstance,
    configuration: IConfigurationValues,
) => {
    const vimSettingKeys: string[] = Object.keys(configuration).filter(
        key => key.indexOf(vimSettingPrefix) === 0,
    )

    vimSettingKeys.forEach(key => {
        const vimSettingValue: any = configuration[key]

        const baseSettingName = key.substring(vimSettingPrefix.length, key.length)

        if (typeof vimSettingValue === "boolean") {
            const settingValue = vimSettingValue ? baseSettingName : "no" + baseSettingName
            neovimInstance.command(`set ${settingValue}`)
        } else {
            neovimInstance.command(`set ${baseSettingName}=${vimSettingValue}`)
        }
    })

    const vimGlobalKeys: string[] = Object.keys(configuration).filter(
        key => key.indexOf(vimGlobalPrefix) === 0,
    )

    vimGlobalKeys.forEach(key => {
        const vimGlobalValue: any = configuration[key]

        const globalSettingName = key.substring(vimGlobalPrefix.length, key.length)
        neovimInstance.command(`let g:${globalSettingName}=${vimGlobalValue}`)
    })
}
