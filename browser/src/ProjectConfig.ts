
/**
 * The conventions for project configuration are inspired from the VSCode launch.json:
 * https://code.visualstudio.com/Docs/editor/debugging
 */

import * as path from "path"
import * as fs from "fs"

import * as Q from "q"

const findParentDir = require("find-parent-dir")

export type LaunchType = "execute"
export type Request = "launch" // attach later


export interface LaunchConfiguration {
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
export interface ProjectConfiguration {
    launchConfigurations: LaunchConfiguration[]
}

const DefaultConfiguration: ProjectConfiguration = {
    launchConfigurations: []
}

/**
 * Get the project configuration for a particular file
 * Search upward for the relevant .oni folder
 */
export function getProjectConfiguration(filePath: string): Q.Promise<ProjectConfiguration> {
    
    const oniDir = findParentDir.sync(filePath, ".oni")
    return loadConfigurationFromFolder(path.join(oniDir, ".oni"))
}

function loadConfigurationFromFolder(folder: string): Q.Promise<ProjectConfiguration> {

    const launchPath = path.join(folder, "launch.json")

    if (!fs.existsSync(launchPath)) {
        return Q(DefaultConfiguration)
    } else {
       const launchInfo: LaunchConfiguration = JSON.parse(fs.readFileSync(launchPath, "utf8")) 

       const config = {...DefaultConfiguration, ...{
           launchConfigurations: [launchInfo] 
       }}

       return Q(config)
    }
}
