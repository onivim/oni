/**
 * DeprecatedConfigurationValues
 *
 * The purpose of this is to give users a heads up when we plan on deprecating a configuration,
 * by providing them with a notice. As we move towards v1, we'll want to have some sort of
 * deprecation policy in place - like we'll support deprecated configurations for x releases.
 */

import * as Log from "oni-core-logging"

export interface IDeprecatedConfigurationInfo {
    replacementConfigurationName: string
    documentationUrl: string
}

const deprecatedSettings: {
    [deprecatedConfigurationName: string]: IDeprecatedConfigurationInfo
} = {
    "editor.completions.enabled": {
        replacementConfigurationName: "editor.completions.mode",
        documentationUrl: "https://github.com/onivim/oni/wiki/Configuration#editor",
    },
}

export const checkDeprecatedSettings = (config: { [key: string]: any }): void => {
    Object.keys(config).forEach(configurationName => {
        if (deprecatedSettings[configurationName]) {
            const deprecationInfo = deprecatedSettings[configurationName]
            Log.warn(
                `Configuration setting '${configurationName}' is deprecated and will be replaced with '${
                    deprecationInfo.replacementConfigurationName
                }'. See more info at: ${deprecationInfo.documentationUrl}`,
            )
        }
    })
}
