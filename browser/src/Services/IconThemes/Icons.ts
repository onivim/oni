/**
 * Icons
 *
 * - Data source for icons present in Oni
 * - Loads icons based on the `ui.iconTheme` configuration setting
 */

import { Event, IEvent } from "oni-types"

import { pluginManager } from "./../Plugins/PluginManager"

// import { IConfigurationValues } from "./Configuration"
// import { getThemeManagerInstance, ThemeManager } from "./Themes"

export interface IIconFontSource {
    path: string
    format: string
}

export interface IIconFont {
    id: string
    src: IIconFontSource[]
    weight: string
    style: string
    size: string
}

export interface IIconDefinition {
    fontCharacter: string
    fontColor: string
}

export interface IIconInfo extends IIconDefinition {
    fontFamily: string
    weight: string
    style: string
    size: string
}

export type IconDefinitions = { [key: string]: IIconDefinition }

// File extension -> icon definition key
export type FileDefinitions = { [extension: string]: string }

// File name -> icon definition key
export type FileNames  = { [fileName: string]: string }

// Language id -> icon definition key
export type Language = { [language: string]: string }

export interface IIconTheme {
    fonts: IIconFontSource
    iconDefinitions: IconDefinitions
    file: FileDefinitions
    fileNames: FileNames
    languageIds: Language
}

import * as fs from "fs"
import { IIconThemeContribution } from "./../Plugins/Api/Capabilities"

export class Icons {

    private _activeIconTheme: IIconTheme = null
    private _onIconThemeChangedEvent: Event<void> = new Event<void>()

    public get activeIconTheme(): IIconTheme {
        return this._activeIconTheme
    }

    public get onIconThemeChanged(): IEvent<void> {
        return this._onIconThemeChangedEvent
    }

    public getIconForFile(fileName: string): IIconInfo {
        return {
            fontFamily: "Segoe UI",
            weight: "bold",
            style: "italic",
            size: "150%",
            fontCharacter: "A",
            fontColor: "white",
        }
    }

    public async applyIconTheme(themeName: string): Promise<void> {

        const plugins = pluginManager.plugins

        const pluginsWithThemes = plugins.filter((p) => {
            return p.metadata && p.metadata.contributes && p.metadata.contributes.iconThemes
        })

        const allIconThemes = pluginsWithThemes.reduce((previous: IIconThemeContribution[], current) => {
            const iconThemes = current.metadata.contributes.iconThemes
            return [
                ...previous,
                ...iconThemes
            ]
        }, [] as IIconThemeContribution[])

        const matchingIconTheme = allIconThemes.find((t) => t.id === themeName)

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

        // From stackoverflow: 
        // https://stackoverflow.com/questions/11355147/font-face-changing-via-javascript

        var newStyle = document.createElement("style")
        newStyle.appendChild(document.createTextNode("\
            @font-face {\
                font-family: seti;\
                src: url('C:/oni/extensions/theme-icons-seti/icons/seti.woff') format('woff');\
            }\
            "));

        document.head.appendChild(newStyle)

        this._activeIconTheme = JSON.parse(contents)
        this._onIconThemeChangedEvent.dispatch()
    }
}

export const icons = new Icons()

export const activate = () => {
    icons.applyIconTheme("theme-icons-seti")
}

// TODO: Icon theme loader
// TODO: Hook up to start
