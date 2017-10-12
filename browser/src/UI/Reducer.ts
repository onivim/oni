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
        case "SET_VIEWPORT":
            return { ...s,
                     viewport: viewportReducer(s.viewport, a) }
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
        case "SET_COLORS":
            return { ...s, ...{
                foregroundColor: a.payload.foregroundColor,
                backgroundColor: a.payload.backgroundColor,
            } }
        case "SHOW_QUICK_INFO":
            const { filePath, line, column, title, description } = a.payload
            return {...s,
                    quickInfo: {
                        filePath,
                        line,
                        column,
                        data: {
                            title,
                            description,
                        },
                }}
        case "HIDE_QUICK_INFO":
            return {...s,
                    quickInfo: null}
        case "SHOW_AUTO_COMPLETION":
            return {...s,
                    autoCompletion: {
                    base: a.payload.base,
                    entries: a.payload.entries,
                    selectedIndex: 0,
                }}
        case "HIDE_AUTO_COMPLETION":
            return {...s,
                    autoCompletion: null}
        case "SHOW_SIGNATURE_HELP":
            return {...s,
                    signatureHelp: a.payload}
        case "HIDE_SIGNATURE_HELP":
            return {...s,
                    signatureHelp: null}
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
        case "HIDE_MESSAGE_DIALOG":
            return {
                ...s,
                activeMessageDialog: null,
            }
        default:
            return {...s,
                    buffers: buffersReducer(s.buffers, a),
                    tabState: tabStateReducer(s.tabState, a),
                    errors: errorsReducer(s.errors, a),
                    autoCompletion: autoCompletionReducer(s.autoCompletion, a), // FIXME: null
                    statusBar: statusBarReducer(s.statusBar, a),
                    windowState: windowStateReducer(s.windowState, a)}
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
            byId = {
                ...s.byId,
                [a.payload.id]: {
                    id: a.payload.id,
                    file: a.payload.file,
                    totalLines: a.payload.totalLines,
                    hidden: a.payload.hidden,
                    listed: a.payload.listed,
                    modified: false,
                },
            }

            if (allIds.indexOf(a.payload.id) === -1) {
                allIds = [...s.allIds, a.payload.id]
            }

            return {
                activeBufferId: a.payload.id,
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
                    version: a.payload.version,
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
                        winline: a.payload.winline,
                        wincolumn: a.payload.wincolumn,
                        windowBottomLine: a.payload.windowBottomLine,
                        windowTopLine: a.payload.windowTopLine,
                    },
                },
            }
        case "SET_WINDOW_DIMENSIONS":
            currentWindow = s.windows[a.payload.windowId] || null

            return {
                ...s,
                windows: {
                    ...s.windows,
                    [a.payload.windowId]: {
                        ...currentWindow,
                        dimensions: a.payload.dimensions,
                    },
                },
            }
        case "SET_WINDOW_LINE_MAP":
            currentWindow = s.windows[a.payload.windowId] || null

            return {
                ...s,
                windows: {
                    ...s.windows,
                    [a.payload.windowId]: {
                        ...currentWindow,
                        lineMapping: a.payload.lineMapping,
                    },
                },
            }
        default:
            return s
    }
}

export function autoCompletionReducer(s: State.IAutoCompletionInfo | null, a: Actions.SimpleAction) {
    if (!s) {
        return s
    }

    // TODO: sync max display items (10) with value in AutoCompletion.render() (AutoCompletion.tsx)
    const currentEntryCount = Math.min(10, s.entries.length)

    switch (a.type) {
        case "NEXT_AUTO_COMPLETION":
            return {...s,
                    selectedIndex: (s.selectedIndex + 1) % currentEntryCount}
        case "PREVIOUS_AUTO_COMPLETION":
            return {...s,
                    selectedIndex: s.selectedIndex > 0 ? s.selectedIndex - 1 : currentEntryCount - 1}
        default:
            return {...s,
                    entries: autoCompletionEntryReducer(s.entries, a)}
    }
}

export function autoCompletionEntryReducer(s: Oni.Plugin.CompletionInfo[], action: Actions.SimpleAction) {
    switch (action.type) {
        case "SET_AUTO_COMPLETION_DETAILS":
            return s.map((entry) => {
                if (action.payload.detailedEntry && entry.label === action.payload.detailedEntry.label) {
                    return action.payload.detailedEntry
                }
                return entry
            })
        default:
            return s
    }
}
