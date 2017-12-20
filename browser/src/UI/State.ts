/**
 * State.ts
 *
 * This file describes the Redux state of the app
 */

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { IConfigurationValues } from "./../Services/Configuration"

import { DefaultThemeColors, IThemeColors } from "./../Services/Themes"

import * as Coordinates from "./Coordinates"
import { Rectangle } from "./Types"

export interface Buffers { [filePath: string]: IBuffer }
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
    fontPixelWidth: number
    fontPixelHeight: number
    fontFamily: string
    fontSize: string
    hasFocus: boolean
    isFullScreen: boolean
    mode: string
    definition: null | IDefinition
    configuration: IConfigurationValues
    imeActive: boolean
    viewport: IViewport

    toolTips: { [id: string]: IToolTip }
    neovimError: boolean

    // Shell
    isLoaded: boolean
    colors: IThemeColors
    windowTitle: string

    statusBar: { [id: string]: IStatusBarItem }

    windowState: IWindowState

    errors: Errors

    // Dimensions of active window, in pixels
    // TODO: This is relevant only to a specific 'editor',
    // so this should be factored to a per-editor store
    activeWindowDimensions: Rectangle
}

export interface IDefinition {
    token: Oni.IToken
    definitionLocation: types.Location
}

export interface Color {
    r: number
    g: number
    b: number
    a: number
}

export interface IMessageDialogButton {
    text: string
    backgroundColor?: Color
    foregroundColor?: Color
    callback?: () => void
}

export interface IBufferState {
    activeBufferId: number
    byId: { [id: number]: IBuffer }
    allIds: number[]
}

export interface IBuffer {
    id: number
    file: string
    modified: boolean
    lastSaveVersion?: number
    version?: number
    totalLines: number
    hidden: boolean
    listed: boolean
}

export interface ITab {
    id: number
    name: string
}

export interface ITabState {
    selectedTabId: number | null,
    tabs: ITab[]
}

export interface IWindowState {
    activeWindow: number,
    windows: { [windowId: number]: IWindow },
}

export interface IWindow {
    file: string
    column: number
    line: number

    bufferToScreen: Coordinates.BufferToScreen
    screenToPixel: Coordinates.ScreenToPixel

    dimensions: Rectangle
    topBufferLine: number
    bottomBufferLine: number
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
    fontPixelWidth: 10,
    fontPixelHeight: 10,
    fontFamily: "",
    fontSize: "",
    hasFocus: false,
    imeActive: false,
    mode: "normal",
    definition: null,
    activeWindowDimensions: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    },
    colors: DefaultThemeColors,
    neovimError: false,
    isLoaded: false,
    isFullScreen: false,

    configuration: {} as IConfigurationValues,

    windowState: {
        activeWindow: null,
        windows: {},
    },

    viewport: {
        width: 0,
        height: 0,
    },

    errors: {},
    statusBar: {},
    toolTips: {},
    windowTitle: "",
})
