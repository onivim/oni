/**
 * Capabilities.ts
 *
 * Export utility types / functions for working with plugin capabilities
 */

export interface Capabilities {
    languageService?: string[]
    subscriptions?: string[]
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

    if (!metadata.oni || !metadata.oni[expectedFileType]) {
        return false
    }

    const capabilities = metadata.oni[expectedFileType]
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

    return true
}
