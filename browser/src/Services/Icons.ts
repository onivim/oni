/**
 * Icons
 *
 * - Data source for icons present in Oni
 * - Loads icons based on the `ui.iconTheme` configuration setting
 */

import { Event, IDisposable, IEvent } from "oni-types"

import { configuration, Configuration, IConfigurationValues } from "./Configuration"
import { getThemeManagerInstance, ThemeManager } from "./Themes"

export interface ColorsDictionary { [colorName: string]: string}

let _colors: Colors = null
export const getInstance = (): Colors => {

    if (_colors === null) {
        _colors = new Colors()
    }

    return _colors
}

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


export class Icons {

    private _activeIconTheme: IIconTheme = null
    private _onIconThemeChangedEvent: Event<void> = new Event<void>()

    public get onIconThemeChanged(): IEvent<void> {
        return this._onIconThemeChangedEvent
    }

    public getIconForFile(fileName: string): IIconDefinition {
        return null
    }

    public async applyIconTheme(themePath: string): Promise<void> {
        // TODO
    }
}

// TODO: Icon theme loader
// TODO: Hook up to start
