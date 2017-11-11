/**
 * Capabilities.ts
 *
 * Export utility types / functions for working with plugin capabilities
 */

/**
 * ActivationMode describes the policy in which the plugin should be activated.
 * `immediate` means the plugin will be executed at startup,
 * `on-demand` means the plugin will be executed when it encounters a command or event it can handle
 */
export type ActivationMode = "immediate" | "on-demand"

export interface Capabilities {
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
}

export interface IPluginMetadata {
    name: string
    main: string
    engines: any
    oni: IPluginCapabilities
}

export interface IPluginCapabilities extends Capabilities {
    activationMode?: ActivationMode
    supportedFileTypes?: string[]
}
