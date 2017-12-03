/**
 * Utilities for working with configuration in tests
 */

import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as mkdirp from "mkdirp"

import * as Platform from "./../../browser/src/Platform"
//
// tslint:disable:no-console

export const configFolder = Platform.isWindows() ? path.join(Platform.getUserHome(), "oni") :
    path.join(Platform.getUserHome(), ".oni")
export const configPath = path.join(configFolder, "config.js")

export const temporaryConfigPath = path.join(os.tmpdir(), "config.js")

export const createConfigFolder = () => {
    if (!fs.existsSync(configFolder)) {
        console.log("Config folder doesn't exist - creating.")
        mkdirp.sync(configFolder)
        console.log("Config folder created successfully.")
    }
}

export const backupConfig = () => {
    if (fs.existsSync(configPath)) {
        console.log("Backing up config to: " + temporaryConfigPath)
        const configContents = fs.readFileSync(configPath, "utf8")
        fs.writeFileSync(temporaryConfigPath, configContents)
        console.log("Config backed up.")
        console.log("Removing existing config..")
        fs.unlinkSync(configPath)
        console.log("Existing config removed")
    }
}

export const restoreConfig = () => {
    if (fs.existsSync(temporaryConfigPath)) {
        console.log("Restoring config from: " + temporaryConfigPath)
        const configContents = fs.readFileSync(temporaryConfigPath, "utf8")
        fs.writeFileSync(configPath, configContents)
        console.log("Config restored to: " + configPath)
        console.log("Deleting temporary config.")
        fs.unlinkSync(temporaryConfigPath)
        console.log("Temporary config successfuly deleted.")
    }
}
