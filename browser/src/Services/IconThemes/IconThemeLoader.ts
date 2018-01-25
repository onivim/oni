/**
 * IconThemeLoader.ts
 *
 * Class responsible for loading an icon theme
 */

import * as fs from "fs"
import { IIconThemeContribution } from "./../../Plugins/Api/Capabilities"

import { IIconTheme } from "./Icons"

import * as Log from "./../../Log"
import { PluginManager } from "./../../Plugins/PluginManager"

export interface IIconThemeLoadResult {
    theme: IIconTheme
    filePath: string
}

export interface IIconThemeLoader {
    loadIconTheme(themeName: string): Promise<IIconThemeLoadResult>
}

export class PluginIconThemeLoader {
    constructor(private _pluginManager: PluginManager) {}

    public async loadIconTheme(themeName: string): Promise<IIconThemeLoadResult> {
        const plugins = this._pluginManager.plugins

        const pluginsWithThemes = plugins.filter(p => {
            return p.metadata && p.metadata.contributes && p.metadata.contributes.iconThemes
        })

        const allIconThemes = pluginsWithThemes.reduce(
            (previous: IIconThemeContribution[], current) => {
                const iconThemes = current.metadata.contributes.iconThemes
                return [...previous, ...iconThemes]
            },
            [] as IIconThemeContribution[],
        )

        const matchingIconTheme = allIconThemes.find(t => t.id === themeName)

        if (!matchingIconTheme || !matchingIconTheme.path) {
            return null
        }

        const contents = await new Promise<string>((resolve, reject) => {
            fs.readFile(matchingIconTheme.path, "utf8", (err, data: string) => {
                if (err) {
                    reject(err)
                    return
                }

                resolve(data)
            })
        })

        let theme = null
        try {
            theme = JSON.parse(contents) as IIconTheme
        } catch (ex) {
            Log.error("Error loading icon theme: " + ex)
        }

        return {
            theme,
            filePath: matchingIconTheme.path,
        }
    }
}
