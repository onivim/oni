/**
 * Capabilities.ts
 *
 * Export utility types / functions for working with plugin capabilities
 */

export interface IContributions {
    commands: ICommandContribution[]
    themes: IThemeContribution[]
    iconThemes: IIconThemeContribution[]
    snippets: ISnippetContribution[]
}

export const DefaultContributions: IContributions = {
    commands: [],
    themes: [],
    iconThemes: [],
    snippets: [],
}

export interface ICommandContribution {
    command: string /* ie, myExtension.myCommand */
    title: string /* My Extension Command */
    category: string /* Testing */
}

export interface IIconThemeContribution {
    id: string
    label: string
    path: string
}

export interface ISnippetContribution {
    language: string
    path: string
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
