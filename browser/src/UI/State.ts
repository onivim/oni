/**
 * State.ts
 *
 * This file describes the Redux state of the app
 */

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { IConfigurationValues } from "./../Services/Configuration"

import { DefaultThemeColors, IThemeColors } from "./../Services/Themes"

export interface Errors { [file: string]: { [key: string]: types.Diagnostic[] } }

/**
 * Viewport encompasses the actual 'app' height
 */
export interface IViewport {
    width: number
    height: number
}

export interface IToolTip {
    id: string,
    options: Oni.ToolTip.ToolTipOptions,
    element: JSX.Element
}

export interface IState {
    // Editor
    hasFocus: boolean
    isFullScreen: boolean
    definition: null | IDefinition
    configuration: IConfigurationValues
    viewport: IViewport

    toolTips: { [id: string]: IToolTip }

    // Shell
    isLoaded: boolean
    colors: IThemeColors
    windowTitle: string

    statusBar: { [id: string]: IStatusBarItem }

    errors: Errors
}

export interface IDefinition {
    token: Oni.IToken
    definitionLocation: types.Location
}

export enum StatusBarAlignment {
    Left,
    Right,
}

export interface IStatusBarItem {
    alignment: StatusBarAlignment
    contents: JSX.Element
    priority: number
    visible: boolean
}

export function readConf<K extends keyof IConfigurationValues>(conf: IConfigurationValues, k: K): IConfigurationValues[K] {

    if (!conf) {
        return null
    } else {
        return conf[k]
    }
}

export const createDefaultState = (): IState => ({
    hasFocus: false,
    definition: null,
    colors: DefaultThemeColors,
    isLoaded: false,
    isFullScreen: false,

    configuration: {} as IConfigurationValues,

    viewport: {
        width: 0,
        height: 0,
    },

    errors: {},
    statusBar: {},
    toolTips: {},
    windowTitle: "",
})
