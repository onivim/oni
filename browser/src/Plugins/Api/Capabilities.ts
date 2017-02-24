/**
 * Capabilities.ts
 *
 * Export utility types / functions for working with plugin capabilities
 */

import * as _ from "lodash"

export interface Capabilities {
    languageService?: string[]
    subscriptions?: string[]
    commands?: { [commandName: string]: ICommandInfo }
}

export interface ICommandInfo {
    name: string
    details: string
}

/**
 * Interface describing 
 */
export interface IPluginFilter {
    fileType: string
    requiredCapabilities: Capabilities
    singlePlugin?: boolean
}

export const createPluginFilter = (fileType: string, requiredCapabilities?: Capabilities, isSinglePlugin?: boolean) => ({
    fileType,
    requiredCapabilities,
    singlePlugin: isSinglePlugin,
})

export const createPluginFilterForCommand = (fileType: string, command: string) => {
    const commands = {}
    commands[command] = null
    return createPluginFilter(fileType, {
        commands,
    }, true)
}

export interface IPluginMetadata {
    main: string
    engines: string
    oni: { [language: string]: Capabilities }
}

/**
 * Returns true if the metadata matches the filter, false otherwise
 */
export const doesMetadataMatchFilter = (metadata: IPluginMetadata, filter: IPluginFilter) => {

    if (!filter || !filter.fileType) {
        return true
    }

    const expectedFileType = filter.fileType

    if (!metadata.oni || (!metadata.oni[expectedFileType] && !metadata.oni["*"])) {
        return false
    }

    const capabilities = metadata.oni[expectedFileType] || metadata.oni["*"]
    const requiredCapabilities = filter.requiredCapabilities

    if (!requiredCapabilities) {
        return true
    }

    return doCapabilitiesMeetRequirements(capabilities, requiredCapabilities)
}

export const doCapabilitiesMeetRequirements = (capabilities: Capabilities, requiredCapabilities: Capabilities) => {
    if (requiredCapabilities.languageService) {

        if (!capabilities.languageService) {
            return false
        }

        if (!!requiredCapabilities.languageService.find((v) => capabilities.languageService.indexOf(v) === -1)) {
            return false
        }
    }

    if (requiredCapabilities.commands) {

        if (!capabilities.commands) {
            return false
        }

        const requiredCommands = _.keys(requiredCapabilities.commands)
        const allCommands = _.keys(capabilities.commands)

        const hasAllRequiredCommands = requiredCommands.every((s) => allCommands.indexOf(s) >= 0)

        if (!hasAllRequiredCommands) {
            return false
        }
    }

    return true
}
