/**
 * State.ts
 *
 * This file describes the Redux state of the app
 */

import * as types from "vscode-languageserver-types"

import { configuration , IConfigurationValues } from "./../Services/Configuration"

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

/**
 * Interface describing an item that is relative
 * to a particular file location
 */
export interface ILocatable<T> {
    filePath: string
    line: number
    column: number
    data: T
}

export interface IState {
    cursorPixelX: number
    cursorPixelY: number
    cursorPixelWidth: number
    cursorCharacter: string
    fontPixelWidth: number
    fontPixelHeight: number
    fontFamily: string
    fontSize: string
    mode: string
    backgroundColor: string
    foregroundColor: string
    autoCompletion: null | IAutoCompletionInfo
    quickInfo: null | ILocatable<Oni.Plugin.QuickInfo>
    signatureHelp: null | ILocatable<types.SignatureHelp>
    cursorLineOpacity: number
    cursorColumnOpacity: number
    configuration: IConfigurationValues
    imeActive: boolean
    viewport: IViewport

    statusBar: { [id: string]: IStatusBarItem }

    /**
     * Tabs refer to the Vim-concept of tabs
     */
    tabState: ITabState

    buffers: IBufferState

    windowState: IWindowState

    errors: Errors

    // Dimensions of active window, in pixels
    // TODO: This is relevant only to a specific 'editor',
    // so this should be factored to a per-editor store
    activeWindowDimensions: Rectangle

    activeMessageDialog: IMessageDialog
}

export enum MessageType {
    Info = 0,
    Warning,
    Error,
}

export interface IMessageDialog {
    messageType: MessageType
    text: string
    buttons: IMessageDialogButton[]
    details?: string
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

    // winline: number
    // wincolumn: number
    // lineMapping: WindowLineMap
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
    return conf[k]
}

export interface IAutoCompletionInfo {

    /**
     * Base entry being completed against
     */
    base: string

    entries: Oni.Plugin.CompletionInfo[]

    /**
     * Label of selected entry
     */
    selectedIndex: number
}

export const createDefaultState = (): IState => ({
    cursorPixelX: 10,
    cursorPixelY: 10,
    cursorPixelWidth: 10,
    cursorCharacter: "",
    fontPixelWidth: 10,
    fontPixelHeight: 10,
    fontFamily: "",
    fontSize: "",
    imeActive: false,
    mode: "normal",
    foregroundColor: "rgba(0, 0, 0, 0)",
    autoCompletion: null,
    quickInfo: null,
    signatureHelp: null,
    activeWindowDimensions: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    },
    cursorLineOpacity: 0,
    cursorColumnOpacity: 0,
    backgroundColor: "#000000",

    configuration: configuration.getValues(),

    buffers: {
        activeBufferId: null,
        byId: {},
        allIds: [],
    },

    tabState: {
        selectedTabId: null,
        tabs: [],
    },

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
    activeMessageDialog: null,
})
