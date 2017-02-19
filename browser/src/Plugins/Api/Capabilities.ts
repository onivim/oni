/**
 * Capabilities.ts
 *
 * Export utility types / functions for working with plugin capabilities
 */

/**
 * Capability categories
 */

export type CapabilityCategory = "subscriptions" | "languageService"

/** 
 * Capabilities
 */
export type Capability = "buffer-update" | "goto-definition" | "completion-provider" | "formatting" | "evaulate-block" | "signature-help"

type RequiredCapability = Record<CapabilityCategory, Capability>
type DeclaredCapabilities = Record<CapabilityCategory, Capability[]>

/**
 * Interface describing 
 */
export interface IPluginFilter {
    fileType: string
    requiredCapabilities?: RequiredCapability
    singlePlugin?: boolean
}

export const createPluginFilter = (fileType: string, requiredCapabilities?: RequiredCapability, isSinglePlugin?: boolean) => ({
    fileType,
    requiredCapabilities,
    singlePlugin: isSinglePlugin,
})


export type CapabilityDeclaration = Record<string /* filetype */, DeclaredCapabilities>

export interface IPluginMetadata {
    engines: string
    oni: CapabilityDeclaration
}

/**
 * Returns true if the metadata matches the filter, false otherwise
 */
export const doesMetadataMatchFilter = (metadata: IPluginMetadata, filter: IPluginFilter) => {
    console.log(JSON.stringify(metadata), JSON.stringify(filter))
    return true
}
