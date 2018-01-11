/**
 * UserConfiguration.ts
 *
 * Helpers and settings relating to per-user configuration
 */

import * as path from "path"

import * as Platform from "./../../Platform"

export const getUserConfigFilePath = (): string => {
    const configFileFromEnv = process.env["ONI_CONFIG_FILE"] as string // tslint:disable-line

    if (configFileFromEnv) {
        return configFileFromEnv
    }

    return path.join(getUserConfigFolderPath(), "config.js")
}

export const getUserConfigFolderPath = (): string => {
    return Platform.isWindows() ? path.join(Platform.getUserHome(), "oni") :
                                  path.join(Platform.getUserHome(), ".oni")
}
