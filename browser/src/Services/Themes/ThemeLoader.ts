/**
 * ThemeLoader
 *
 * - Manages loading of themes
 */

import * as fs from "fs"

import { DefaultTheme, IThemeMetadata } from "./ThemeManager"

import { IThemeContribution } from "./../../Plugins/Api/Capabilities"
import { PluginManager } from "./../../Plugins/PluginManager"

export interface IThemeLoader {
    getThemeByName(name: string): Promise<IThemeMetadata>
}

export class DefaultLoader implements IThemeLoader {
    public async getThemeByName(name: string): Promise<IThemeMetadata> {
        return DefaultTheme
    }
}

export class PluginThemeLoader implements IThemeLoader {

    constructor(
        private _pluginManager: PluginManager,
    ) { }

    public async getThemeByName(name: string): Promise<IThemeMetadata> {

        const plugins = this._pluginManager.plugins

        const pluginsWithThemes = plugins.filter((p) => {
            return p.metadata && p.metadata.contributes && p.metadata.contributes.themes
        })

        const allThemes = pluginsWithThemes.reduce((previous: IThemeContribution[], current) => {
            const themes = current.metadata.contributes.themes
            return [
                ...previous,
                ...themes,
            ]
        }, [] as IThemeContribution[])

        const matchingTheme = allThemes.find((t) => t.name === name)

        if (!matchingTheme || !matchingTheme.path) {
            return null
        }

        return this._loadThemeFromFile(matchingTheme.path)
    }

    private async _loadThemeFromFile(themeJsonPath: string): Promise<IThemeMetadata> {
        const contents = await new Promise<string>((resolve, reject) => {
            fs.readFile(themeJsonPath, "utf8", (err, data: string) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(data)
            })
        })

        return JSON.parse(contents) as IThemeMetadata
    }
}
