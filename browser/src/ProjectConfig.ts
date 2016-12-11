
/**
 * The conventions for project configuration are inspired from the VSCode launch.json:
 * https://code.visualstudio.com/Docs/editor/debugging
 */

// import * as path from "path"

// import * as findParentDir from "find-parent-dir"
const findParentDir = require("find-parent-dir")

export type LaunchType = "execute"
export type Request = "launch" // attach later


export interface LaunchConfiguration {
    type: LaunchType
    name: string
    program: string
    args: string[]
    cwd: string
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
export function getProjectConfiguration(filePath: string): Promise<ProjectConfiguration> {
    
    const oniDir = findParentDir.sync(filePath, ".oni")
    return loadConfigurationFromFolder(oniDir)
}

function loadConfigurationFromFolder(folder: string): Promise<ProjectConfiguration> {
    console.log(folder)
    debugger
    return Promise.resolve(DefaultConfiguration)
}
