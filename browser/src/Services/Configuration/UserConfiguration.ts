/**
 * UserConfiguration.ts
 *
 * Helpers and settings relating to per-user configuration
 */

import * as path from "path"

import * as Platform from "./../../Platform"

import * as Log from "./../../Log"

export const getUserConfigFilePath = (): string => {
    const configFileFromEnv = process.env["ONI_CONFIG_FILE"] as string // tslint:disable-line

    if (configFileFromEnv) {
        Log.info(
            "getUserConfigFilePath - path overridden by environment variable:  " +
                configFileFromEnv,
        )
        return configFileFromEnv
    }

    return path.join(getUserConfigFolderPath(), "config.js")
}

export const getUserConfigFolderPath = (): string => {
    const configFileFromEnv = process.env["ONI_CONFIG_FILE"] as string // tslint:disable-line
    Log.info("$env:ONI_CONFIG_FILE: " + configFileFromEnv)

    if (configFileFromEnv) {
        const configDir = path.dirname(configFileFromEnv)
        Log.info("getUserConfigFolderPath - path overridden by environment variable:  " + configDir)
        return configDir
    }

    return Platform.isWindows()
        ? path.join(Platform.getUserHome(), "oni")
        : path.join(Platform.getUserHome(), ".oni")
}
