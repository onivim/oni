/**
 * State.ts
 *
 * This file describes the Redux state of the app
 */

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { IConfigurationValues } from "./../../Services/Configuration"
import { DefaultThemeColors, IThemeColors } from "./../../Services/Themes"

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

export type StatusBar = { [key: string]: IStatusBarItem }
export type Overlays = { [key: string]: IOverlay }

export interface IState {
    // Editor
    hasFocus: boolean
    isFullScreen: boolean
    configuration: IConfigurationValues

    // Shell
    isLoaded: boolean
    colors: IThemeColors
    windowTitle: string

    statusBar: { [id: string]: IStatusBarItem }
    overlays: { [id: string]: IOverlay }

    errors: Errors
}

export interface IOverlay {
    id: string
    contents: JSX.Element
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
    colors: DefaultThemeColors,
    isLoaded: false,
    isFullScreen: false,

    configuration: {} as IConfigurationValues,

    errors: {},
    overlays: {},
    statusBar: {},
    windowTitle: "",
})
