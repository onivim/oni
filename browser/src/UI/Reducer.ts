/**
 * Reducer.ts
 *
 * Top-level reducer for UI state transforms
 */

import * as State from "./State"

import * as Actions from "./Actions"

import { IConfigurationValues } from "./../Services/Configuration"

import * as pick from "lodash/pick"

import * as types from "vscode-languageserver-types"

export function reducer<K extends keyof IConfigurationValues>(s: State.IState, a: Actions.Action<K>) {

    if (!s) {
        return s
    }

    switch (a.type) {
        case "ENTER_FULL_SCREEN":
            return {
                ...s,
                isFullScreen: true,
            }
        case "LEAVE_FULL_SCREEN":
            return {
                ...s,
                isFullScreen: false,
            }
        case "SET_HAS_FOCUS":
            return {
                ...s,
                hasFocus: a.payload.hasFocus,
            }
        case "SET_LOADING_COMPLETE":
            return {
                ...s,
                isLoaded: true,
            }
        case "SET_WINDOW_TITLE":
            return {
                ...s,
                windowTitle: a.payload.title,
            }
        case "SET_COLORS":
            return {
                ...s,
                colors: a.payload.colors,
                    }
        case "SET_NEOVIM_ERROR":
             return { ...s,
                      neovimError: a.payload.neovimError }
        case "SET_VIEWPORT":
            return { ...s,
                     viewport: viewportReducer(s.viewport, a) }
        case "SET_CURSOR_SCALE":
            return {
            ...s,
            cursorScale: a.payload.cursorScale,
        }
        case "SET_CURSOR_POSITION":
            return {...s,
                    cursorPixelX: a.payload.pixelX,
                    cursorPixelY: a.payload.pixelY,
                    fontPixelWidth: a.payload.fontPixelWidth,
                    fontPixelHeight: a.payload.fontPixelHeight,
                    cursorCharacter: a.payload.cursorCharacter,
                    cursorPixelWidth: a.payload.cursorPixelWidth }
        case "SET_IME_ACTIVE":
            return { ...s,
                     imeActive: a.payload.imeActive }
        case "SET_FONT":
            return { ...s,
                     fontFamily: a.payload.fontFamily,
                     fontSize: a.payload.fontSize }
        case "SET_MODE":
            return { ...s, ...{ mode: a.payload.mode } }
        case "SET_CONFIGURATION_VALUE":
            const obj: Partial<IConfigurationValues> = {}
            obj[a.payload.key] = a.payload.value
            const newConfig = {...s.configuration, ...obj}
            return {...s,
                    configuration: newConfig}

        case "SHOW_MESSAGE_DIALOG":
            return {
                ...s,
                activeMessageDialog: a.payload,
            }
        case "SHOW_COMMAND_LINE":
            return {
                ...s,
                commandLine: {
                    content: a.payload.content,
                    pos: a.payload.pos,
                    firstchar: a.payload.firstchar,
                    prompt: a.payload.prompt,
                    indent: a.payload.indent,
                    level: a.payload.level,
                },
            }
        case "HIDE_COMMAND_LINE":
            return {
                ...s,
                commandLine: null,
            }
        case "SET_COMMAND_LINE_POSITION":
            return {
                ...s,
                commandLine :  {...s.commandLine, position: a.payload.position},
            }
        case "HIDE_MESSAGE_DIALOG":
            return {
                ...s,
                activeMessageDialog: null,
            }
        default:
            return {...s,
                    buffers: buffersReducer(s.buffers, a),
                    definition: definitionReducer(s.definition, a),
                    tabState: tabStateReducer(s.tabState, a),
                    errors: errorsReducer(s.errors, a),
                    statusBar: statusBarReducer(s.statusBar, a),
                    toolTips: toolTipsReducer(s.toolTips, a),
                    windowState: windowStateReducer(s.windowState, a)}
    }
}

export const definitionReducer = (s: State.IDefinition, a: Actions.SimpleAction) => {
    switch (a.type) {
        case "SHOW_DEFINITION":
            const { definitionLocation, token } = a.payload
            return {
                    definitionLocation,
                    token,
                }
        case "HIDE_DEFINITION":
            return null
        default:
            return s
    }
}

export const viewportReducer = (s: State.IViewport, a: Actions.ISetViewportAction) => {
    switch (a.type) {
        case "SET_VIEWPORT":
            return {
                width: a.payload.width,
                height: a.payload.height,
        }
        default:
            return s
    }
}

export const tabStateReducer = (s: State.ITabState, a: Actions.SimpleAction): State.ITabState => {
    switch (a.type) {
        case "SET_TABS":
            return {
                ...s,
                ...a.payload,
            }
        default:
            return s
    }
}

export const buffersReducer = (s: State.IBufferState, a: Actions.SimpleAction): State.IBufferState => {

    let byId = s.byId
    let allIds = s.allIds

    const emptyBuffer = (id: number): State.IBuffer => ({
        id,
        file: null,
        modified: false,
        hidden: true,
        listed: false,
        totalLines: 0,
    })

    switch (a.type) {
        case "BUFFER_ENTER":

            byId = a.payload.buffers.reduce((buffersById, buffer) => {
                buffersById[buffer.id] = {
                    ...buffer,
                    modified: false,
                }
                return byId
            }, byId)

            const bufIds = a.payload.buffers.map(b => b.id)

            allIds = [ ...new Set(bufIds)]

            return {
                activeBufferId: a.payload.buffers[0].id,
                byId,
                allIds,
            }
        case "BUFFER_SAVE":
            const currentItem = s.byId[a.payload.id] || emptyBuffer(a.payload.id)
            byId = {
                ...s.byId,
                [a.payload.id]: {
                    ...currentItem,
                    id: a.payload.id,
                    modified: a.payload.modified,
                    lastSaveVersion: a.payload.version,
                },
            }

            return {
                ...s,
                byId,
            }
        case "BUFFER_UPDATE":
            const currentItem3 = s.byId[a.payload.id] || emptyBuffer(a.payload.id)

            // If the last save version hasn't been set, this means it is the first update,
            // and should clamp to the incoming version
            const lastSaveVersion = currentItem3.lastSaveVersion || a.payload.version

            byId = {
                ...s.byId,
                [a.payload.id]: {
                    ...currentItem3,
                    id: a.payload.id,
                    modified: a.payload.modified,
                    totalLines: a.payload.totalLines,
                    lastSaveVersion,
                },
            }

            return {
                ...s,
                byId,
            }
        case "SET_CURRENT_BUFFERS":
            allIds = s.allIds.filter((id) => a.payload.bufferIds.indexOf(id) >= 0)

            let activeBufferId = s.activeBufferId

            if (a.payload.bufferIds.indexOf(activeBufferId) === -1) {
                activeBufferId = null
            }

            const newById: any = pick(s.byId, a.payload.bufferIds)

            return {
                activeBufferId,
                byId: newById,
                allIds,
            }
        default:
            return s
    }
}

export const errorsReducer = (s: { [file: string]: { [key: string]: types.Diagnostic[] } }, a: Actions.SimpleAction) => {
    switch (a.type) {
        case "SET_ERRORS":

            const currentFile = s[a.payload.file] || null

            return {
                ...s,
                [a.payload.file]: {
                    ...currentFile,
                    [a.payload.key]: [...a.payload.errors],
                },
            }
        default:
            return s
    }
}

export const toolTipsReducer = (s: { [key: string]: State.IToolTip }, a: Actions.SimpleAction) => {
    switch (a.type) {
        case "SHOW_TOOL_TIP":
            const existingItem = s[a.payload.id] || {}
            const newItem = {
                ...existingItem,
                ...a.payload,
            }

            return {
                ...s,
                [a.payload.id]: newItem,
            }
        case "HIDE_TOOL_TIP":
            return {
                ...s,
                [a.payload.id]: null,
            }
        default:
            return s
    }
}

export const statusBarReducer = (s: { [key: string]: State.IStatusBarItem }, a: Actions.SimpleAction) => {
    switch (a.type) {
        case "STATUSBAR_SHOW":
            const existingItem = s[a.payload.id] || {}
            const newItem = {
                ...existingItem,
                ...a.payload,
            }

            return {
                ...s,
                [a.payload.id]: newItem,
            }
        case "STATUSBAR_HIDE":
            return {
                ...s,
                [a.payload.id]: null,
            }
        default:
            return s
    }
}

export const windowStateReducer = (s: State.IWindowState, a: Actions.SimpleAction): State.IWindowState => {

    let currentWindow
    switch (a.type) {
        case "SET_WINDOW_CURSOR":
            currentWindow = s.windows[a.payload.windowId] || null

            return {
                activeWindow: a.payload.windowId,
                windows: {
                    ...s.windows,
                    [a.payload.windowId]: {
                        ...currentWindow,
                        column: a.payload.column,
                        line: a.payload.line,
                    },
                },
            }
        case "SET_WINDOW_STATE":
            currentWindow = s.windows[a.payload.windowId] || null

            return {
                activeWindow: a.payload.windowId,
                windows: {
                    ...s.windows,
                    [a.payload.windowId]: {
                        ...currentWindow,
                        file: a.payload.file,
                        column: a.payload.column,
                        line: a.payload.line,
                        bufferToScreen: a.payload.bufferToScreen,
                        screenToPixel: a.payload.screenToPixel,
                        dimensions: a.payload.dimensions,

                        topBufferLine: a.payload.topBufferLine,
                        bottomBufferLine: a.payload.bottomBufferLine,
                    },
                },
            }
        default:
            return s
    }
}
