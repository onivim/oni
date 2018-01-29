/**
 * State.ts
 *
 * This file describes the Redux state of the app
 */

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"
import { Store } from "redux"
import thunk from "redux-thunk"

import { IConfigurationValues } from "./../../Services/Configuration"

import { DefaultThemeColors, IThemeColors } from "./../../Services/Themes"

import { createStore as createReduxStore } from "./../../Redux"

export interface Layers {
    [id: number]: Oni.EditorLayer[]
}
export interface Buffers {
    [filePath: string]: IBuffer
}
export interface Errors {
    [file: string]: { [key: string]: types.Diagnostic[] }
}
export interface ToolTips {
    [id: string]: IToolTip
}

import { reducer } from "./NeovimEditorReducer"

/**
 * Viewport encompasses the actual 'app' height
 */
export interface IViewport {
    width: number
    height: number
    focusedEditor: {
        width: number,
        height: number,
    }
}

export interface IToolTip {
    id: string
    options?: Oni.ToolTip.ToolTipOptions
    element: JSX.Element
}

export interface IState {
    // Editor
    cursorScale: number
    cursorPixelX: number
    cursorPixelY: number
    cursorPixelWidth: number
    cursorCharacter: string
    fontPixelWidth: number
    fontPixelHeight: number
    fontFamily: string
    fontSize: string
    hasFocus: boolean
    mode: string
    definition: null | IDefinition
    cursorLineOpacity: number
    cursorColumnOpacity: number
    configuration: IConfigurationValues
    imeActive: boolean
    isLoaded: boolean
    viewport: IViewport
    colors: IThemeColors

    toolTips: ToolTips
    neovimError: boolean

    /**
     * Tabs refer to the Vim-concept of tabs
     */
    tabState: ITabState

    buffers: IBufferState

    layers: Layers

    windowState: IWindowState

    errors: Errors

    activeVimTabPage: IVimTabPage

    commandLine: ICommandLine | null
    wildmenu: IWildMenu
}

export interface IWildMenu {
    selected: number
    visible: boolean
    options: string[]
}

export interface ICommandLine {
    visible: boolean
    content: string
    firstchar: string
    position: number
    prompt: string
    indent: number
    level: number
}

export interface IDefinition {
    token: Oni.IToken
    definitionLocation: types.Location
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
    selectedTabId: number | null
    tabs: ITab[]
}

export interface IVimTabPage {
    id: number
    windowIds: number[]
}

export interface IWindowState {
    activeWindow: number
    windows: { [windowId: number]: IWindow }
}

export interface IWindow {
    file: string
    bufferId: number
    windowId: number
    column: number
    line: number

    bufferToScreen: Oni.Coordinates.BufferToScreen
    screenToPixel: Oni.Coordinates.ScreenToPixel

    dimensions: Oni.Shapes.Rectangle
    topBufferLine: number
    bottomBufferLine: number
}

export function readConf<K extends keyof IConfigurationValues>(
    conf: IConfigurationValues,
    k: K,
): IConfigurationValues[K] {
    if (!conf) {
        return null
    } else {
        return conf[k]
    }
}

export const createDefaultState = (): IState => ({
    cursorScale: 1,
    cursorPixelX: 10,
    cursorPixelY: 10,
    cursorPixelWidth: 10,
    cursorCharacter: "",
    fontPixelWidth: 10,
    fontPixelHeight: 10,
    fontFamily: "",
    fontSize: "",
    hasFocus: false,
    imeActive: false,
    mode: "normal",
    definition: null,
    colors: DefaultThemeColors,
    cursorLineOpacity: 0,
    cursorColumnOpacity: 0,
    neovimError: false,
    isLoaded: false,

    activeVimTabPage: null,

    configuration: {} as IConfigurationValues,

    buffers: {
        activeBufferId: null,
        byId: {},
        allIds: [],
    },

    layers: {},

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
        focusedEditor: {
            width: 0,
            height: 0,
        },
    },

    errors: {},
    toolTips: {},
    commandLine: {
        content: null,
        prompt: null,
        indent: null,
        level: null,
        visible: false,
        firstchar: "",
        position: 0,
    },
    wildmenu: {
        selected: null,
        visible: false,
        options: [],
    },
})

let neovimEditorId = 0

export const createStore = (): Store<IState> => {
    const editorId = neovimEditorId++
    return createReduxStore("NeovimEditor" + editorId.toString(), reducer, createDefaultState(), [
        thunk,
    ])
}
