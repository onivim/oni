/**
 * UserConfiguration.ts
 *
 * Helpers and settings relating to per-user configuration
 */

import * as path from "path"

import * as Platform from "./../../Platform"

import * as Log from "./../../Log"

export const getUserConfigFilePath = (): string => {
    return path.join(getUserConfigFolderPath(), "config.js")
}

export const getUserConfigFolderPath = (): string => {
    const configFileFromEnv = process.env["ONI_CONFIG_FILE"] as string // tslint:disable-line
    Log.info("$env:ONI_CONFIG_FILE: " + configFileFromEnv)

    if (configFileFromEnv) {
        Log.info("getUserConfigFolderPath: " + configFileFromEnv)
        return path.dirname(configFileFromEnv)
    }

    return Platform.isWindows()
        ? path.join(Platform.getUserHome(), "oni")
        : path.join(Platform.getUserHome(), ".oni")
}
