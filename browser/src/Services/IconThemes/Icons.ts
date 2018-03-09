/**
 * Icons
 *
 * - Data source for icons present in Oni
 * - Loads icons based on the `ui.iconTheme` configuration setting
 */

import * as path from "path"

import { Event, IEvent } from "oni-types"

import { PluginManager } from "./../../Plugins/PluginManager"

import { PluginIconThemeLoader } from "./IconThemeLoader"
import { StyleWriter } from "./StyleWriter"

import * as Utility from "./../../Utility"

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

export interface IconDefinitions {
    [key: string]: IIconDefinition
}

// File extension -> icon definition key
export interface FileDefinitions {
    [extension: string]: string
}

// File name -> icon definition key
export interface FileNames {
    [fileName: string]: string
}

// Language id -> icon definition key
export interface Language {
    [language: string]: string
}

export interface IIconTheme {
    fonts: IIconFont[]
    iconDefinitions: IconDefinitions
    file: string
    fileExtensions: FileDefinitions
    fileNames: FileNames
    languageIds: Language
    light?: IIconTheme
}

export class Icons {
    private _activeIconTheme: IIconTheme = null
    private _onIconThemeChangedEvent: Event<void> = new Event<void>()

    public get activeIconTheme(): IIconTheme {
        return this._activeIconTheme
    }

    public get onIconThemeChanged(): IEvent<void> {
        return this._onIconThemeChangedEvent
    }

    constructor(private _pluginManager: PluginManager) {}

    public getIconClassForFile(fileName: string, language?: string): string {
        if (!this._activeIconTheme) {
            return null
        }

        const normalizedFileName = fileName.toLowerCase()
        const classBase = "fa oni-icon oni-icon-"

        // First, see if there is a matching file name
        if (this._activeIconTheme.fileNames) {
            const fileNameIcon = this._activeIconTheme.fileNames[normalizedFileName]

            if (fileNameIcon) {
                return classBase + fileNameIcon
            }
        }

        // Next, see if there is a matching extension
        if (this._activeIconTheme.fileExtensions) {
            const extension = path.extname(fileName)
            if (extension && extension.length > 1) {
                const extensionWithoutPeriod = extension.substring(1, extension.length)

                const matchingExtension = this._activeIconTheme.fileExtensions[
                    extensionWithoutPeriod
                ]
                if (matchingExtension) {
                    return classBase + matchingExtension
                }
            }
        }

        // Finally, see if there is a matching language
        if (language && this._activeIconTheme.languageIds) {
            const matchingLanguage = this._activeIconTheme.languageIds[language]

            if (matchingLanguage) {
                return classBase + matchingLanguage
            }
        }

        if (this._activeIconTheme.file) {
            return classBase + this._activeIconTheme.file
        }

        return null
    }

    public async applyIconTheme(themeName: string): Promise<void> {
        const iconThemeLoader = new PluginIconThemeLoader(this._pluginManager)

        const loadResults = await iconThemeLoader.loadIconTheme(themeName)

        if (!loadResults || !loadResults.theme) {
            return
        }

        this._activeIconTheme = loadResults.theme

        const newStyle = document.createElement("style")
        const styleWriter = new StyleWriter("oni-icon")

        const fonts = this._activeIconTheme.fonts || []

        fonts.forEach(font => {
            if (!font.src || !font.src.length) {
                return
            }

            const fontSrc = font.src[0]
            const fontPath = Utility.normalizePath(
                path.join(path.dirname(loadResults.filePath), fontSrc.path),
            )
            const fontFormat = fontSrc.format

            styleWriter.writeFontFace(font.id, fontPath, fontFormat)
        })

        const iconDefinitions = this._activeIconTheme.iconDefinitions
        if (iconDefinitions) {
            Object.keys(iconDefinitions).forEach((definitionName: string) => {
                const definitionContents = iconDefinitions[definitionName]
                styleWriter.writeIcon(
                    definitionName,
                    definitionContents.fontColor,
                    definitionContents.fontCharacter,
                )
            })
        }

        newStyle.appendChild(document.createTextNode(styleWriter.style))

        document.head.appendChild(newStyle)

        this._onIconThemeChangedEvent.dispatch()
    }
}
