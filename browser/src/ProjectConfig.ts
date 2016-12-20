
/**
 * The conventions for project configuration are inspired from the VSCode launch.json:
 * https://code.visualstudio.com/Docs/editor/debugging
 */

import * as fs from "fs"
import * as path from "path"

import * as Q from "q"

const findParentDir = require("find-parent-dir") // tslint:disable-line no-var-requires

export type LaunchType = "execute"
export type Request = "launch" // attach later

export interface ILaunchConfiguration {
    type: LaunchType
    name: string
    program: string
    args: string[]
    cwd: string,
    dependentCommands: string[]
}

/**
 * Per-project configuration options
 */
export interface IProjectConfiguration {
    launchConfigurations: ILaunchConfiguration[],
}

const DefaultConfiguration: IProjectConfiguration = {
    launchConfigurations: [],
}

/**
 * Get the project configuration for a particular file
 * Search upward for the relevant .oni folder
 */
export function getProjectConfiguration(filePath: string): Q.Promise<IProjectConfiguration> {
    const oniDir = findParentDir.sync(filePath, ".oni")

    if (!oniDir) {
        return Q(DefaultConfiguration)
    }

    return loadConfigurationFromFolder(path.join(oniDir, ".oni"))
}

function loadConfigurationFromFolder(folder: string): Q.Promise<IProjectConfiguration> {

    const launchPath = path.join(folder, "launch.json")

    if (!fs.existsSync(launchPath)) {
        return Q(DefaultConfiguration)
    } else {
       const launchInfo: ILaunchConfiguration = JSON.parse(fs.readFileSync(launchPath, "utf8"))
       const config = {...DefaultConfiguration, ...{
           launchConfigurations: [launchInfo],
       }}

       return Q(config)
    }
}
