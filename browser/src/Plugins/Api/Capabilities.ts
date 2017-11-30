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
export interface IContributions {
    commands: ICommandContribution[]
    themes: IThemeContribution[]
}

export const DefaultContributions: IContributions = {
    commands: [],
    themes: [],
}

export interface ICommandContribution {
    command: string /* ie, myExtension.myCommand */
    title: string /* My Extension Command */
    category: string /* Testing */
}

export interface IThemeContribution {
    name: string
    path: string
}

export interface IPluginMetadata {
    name: string
    main: string
    engines: any
    contributes: IContributions
}
