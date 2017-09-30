/**
 * State.ts
 *
 * This file describes the Redux state of the app
 */

import * as Config from "./../Config"
import { Rectangle } from "./Types"

import * as types from "vscode-languageserver-types"

export interface Buffers { [filePath: string]: IBuffer }
export interface Errors { [file: string]: { [key: string]: types.Diagnostic[] } }
export interface WindowLineMap { [key: number]: number }

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
    quickInfo: null | Oni.Plugin.QuickInfo
    popupMenu: null | IMenu
    signatureHelp: null | Oni.Plugin.SignatureHelpResult
    cursorLineVisible: boolean
    cursorLineOpacity: number
    cursorColumnVisible: boolean
    cursorColumnOpacity: number
    configuration: Config.IConfigValues
    imeActive: boolean

    statusBar: { [id: string]: IStatusBarItem }

    /**
     * Tabs refer to the Vim-concept of tabs
     */
    tabState: ITabState

    buffers: IBufferState

    windowState: IWindowState

    errors: Errors

    // Dimensions of active window, in pixels
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
    winline: number
    wincolumn: number
    lineMapping: WindowLineMap
    dimensions: Rectangle
    windowTopLine: number
    windowBottomLine: number
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

export function readConf<K extends keyof Config.IConfigValues>(conf: Config.IConfigValues, k: K): Config.IConfigValues[K] {
    return conf[k]
}

export interface IMenu {
    id: string,
    filter: string,
    filteredOptions: IMenuOptionWithHighlights[],
    options: Oni.Menu.MenuOption[],
    selectedIndex: number
}

export interface IMenuOptionWithHighlights extends Oni.Menu.MenuOption {
    labelHighlights: number[][],
    detailHighlights: number[][]
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
    popupMenu: null,
    signatureHelp: null,
    activeWindowDimensions: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    },
    cursorLineVisible: false,
    cursorLineOpacity: 0,
    cursorColumnVisible: false,
    cursorColumnOpacity: 0,
    backgroundColor: "#000000",

    configuration: Config.instance().getValues(),

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

    errors: {},
    statusBar: {},
    activeMessageDialog: null,
})
