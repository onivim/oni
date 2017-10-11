/**
 * ActionCreators.ts
 *
 * Action Creators are relatively simple - they are just a function that returns an `Action`
 *
 * For information on Action Creators, check out this link:
 * http://redux.js.org/docs/basics/Actions.html
 */

import * as types from "vscode-languageserver-types"

import * as Events from "./Events"
import { Rectangle } from "./Types"

import * as Actions from "./Actions"
import * as State from "./State"

import { IScreen } from "./../Screen"
import { normalizePath } from "./../Utility"

import { IConfigurationValues } from "./../Services/Configuration"

export type DispatchFunction = (action: any) => void
export type GetStateFunction = () => State.IState

export const setViewport = (width: number, height: number) => ({
    type: "SET_VIEWPORT",
    payload: {
        width,
        height,
    },
})

export const bufferEnter = (id: number, file: string, totalLines: number, hidden: boolean, listed: boolean) => ({
    type: "BUFFER_ENTER",
    payload: {
        id,
        file: normalizePath(file),
        totalLines,
        hidden,
        listed,
    },
})

export const bufferUpdate = (id: number, modified: boolean, version: number, totalLines: number) => ({
    type: "BUFFER_UPDATE",
    payload: {
        id,
        modified,
        version,
        totalLines,
    },
})

export const bufferSave = (id: number, modified: boolean, version: number) => ({
    type: "BUFFER_SAVE",
    payload: {
        id,
        modified,
        version,
    },
})

export const setCurrentBuffers = (bufferIds: number[]) => ({
    type: "SET_CURRENT_BUFFERS",
    payload: {
        bufferIds,
    },
})

export const setImeActive = (imeActive: boolean) => ({
    type: "SET_IME_ACTIVE",
    payload: {
        imeActive,
    },
})

export const setFont = (fontFamily: string, fontSize: string) => ({
    type: "SET_FONT",
    payload: {
        fontFamily,
        fontSize,
    },
})

export const setTabs = (selectedTabId: number, tabs: State.ITab[]): Actions.ISetTabs => ({
    type: "SET_TABS",
    payload: {
        selectedTabId,
        tabs,
    },
})

export const setWindowState = (windowId: number, file: string, column: number, line: number, winline: number, wincolumn: number, windowTopLine: number, windowBottomLine: number) => ({
    type: "SET_WINDOW_STATE",
    payload: {
        windowId,
        file: normalizePath(file),
        column,
        line,
        winline,
        wincolumn,
        windowTopLine,
        windowBottomLine,
    },
})

export const setWindowLineMapping = (windowId: number, lineMapping: State.WindowLineMap) => ({
    type: "SET_WINDOW_LINE_MAP",
    payload: {
        windowId,
        lineMapping,
    },
})

export const setWindowDimensions = (windowId: number, dimensions: Rectangle) => ({
    type: "SET_WINDOW_DIMENSIONS",
    payload: {
        windowId,
        dimensions,
    },
})

export const setErrors = (file: string, key: string, errors: types.Diagnostic[]) => ({
    type: "SET_ERRORS",
    payload: {
        file: normalizePath(file),
        key,
        errors,
    },
})

export const clearErrors = (file: string, key: string) => ({
    type: "CLEAR_ERRORS",
    payload: {
        file,
        key,
    },
})

export const showMessageDialog = (messageType: State.MessageType, text: string, buttons: State.IMessageDialogButton[], details?: string): Actions.IShowMessageDialog => ({
    type: "SHOW_MESSAGE_DIALOG",
    payload: {
        messageType,
        text,
        buttons,
        details,
    },
})

export const hideMessageDialog = (): Actions.IHideMessageDialog => ({
    type: "HIDE_MESSAGE_DIALOG",
})

export const showStatusBarItem = (id: string, contents: JSX.Element, alignment?: State.StatusBarAlignment, priority?: number) => (dispatch: DispatchFunction, getState: GetStateFunction) => {

    const currentStatusBarItem = getState().statusBar[id]

    if (currentStatusBarItem) {
        alignment = alignment || currentStatusBarItem.alignment
        priority = priority || currentStatusBarItem.priority
    }

    dispatch({
        type: "STATUSBAR_SHOW",
        payload: {
            id,
            contents,
            alignment,
            priority,
        },
    })
}

export const hideStatusBarItem = (id: string) => ({
    type: "STATUSBAR_HIDE",
    payload: {
        id,
    },
})

export const showCompletions = (result: Oni.Plugin.CompletionResult) => (dispatch: DispatchFunction, getState: GetStateFunction) => {
    dispatch(_showAutoCompletion(result.base, result.completions))

    if (result.completions.length > 0) {
        emitCompletionItemSelectedEvent(getState())
    }
}

export const previousCompletion = () => (dispatch: DispatchFunction, getState: GetStateFunction) => {
    dispatch(_previousAutoCompletion())

    emitCompletionItemSelectedEvent(getState())
}

export const nextCompletion = () => (dispatch: DispatchFunction, getState: GetStateFunction) => {
    dispatch(_nextAutoCompletion())

    emitCompletionItemSelectedEvent(getState())
}

function emitCompletionItemSelectedEvent(state: State.IState): void {
    const autoCompletion = state.autoCompletion
    if (autoCompletion != null) {
        const entry = autoCompletion.entries[autoCompletion.selectedIndex]
        Events.events.emit(Events.CompletionItemSelectedEvent, entry)
    }
}

export const setCursorPosition = (screen: IScreen) => (dispatch: DispatchFunction) => {
    const cell = screen.getCell(screen.cursorColumn, screen.cursorRow)

    if (screen.cursorRow === screen.height - 1) {
        dispatch(hideQuickInfo())
        dispatch(hideSignatureHelp())
    }

    dispatch(_setCursorPosition(screen.cursorColumn * screen.fontWidthInPixels, screen.cursorRow * screen.fontHeightInPixels, screen.fontWidthInPixels, screen.fontHeightInPixels, cell.character, cell.characterWidth * screen.fontWidthInPixels))
}

export const setColors = (foregroundColor: string, backgroundColor: string) => (dispatch: DispatchFunction, getState: GetStateFunction) => {
    if (foregroundColor === getState().foregroundColor && backgroundColor === getState().backgroundColor) {
        return
    }

    dispatch(_setColors(foregroundColor, backgroundColor))
}

export const setMode = (mode: string) => ({
    type: "SET_MODE",
    payload: { mode },
})

export const showSignatureHelp = (signatureHelpResult: Oni.Plugin.SignatureHelpResult) => ({
    type: "SHOW_SIGNATURE_HELP",
    payload: signatureHelpResult,
})

export const hideSignatureHelp = () => ({
    type: "HIDE_SIGNATURE_HELP",
})

export const showPopupMenu = (id: string, options: Oni.Menu.MenuOption[]) => ({
    type: "SHOW_MENU",
    payload: {
        id,
        options,
    },
})

export const hidePopupMenu = () => ({
    type: "HIDE_MENU",
})

export const previousMenuItem = () => ({
    type: "PREVIOUS_MENU",
})

export const filterMenu = (filterString: string) => ({
    type: "FILTER_MENU",
    payload: {
        filter: filterString,
    },
})

export const nextMenuItem = () => ({
    type: "NEXT_MENU",
})

export const selectMenuItem = (openInSplit: string, index?: number) => (dispatch: DispatchFunction, getState: GetStateFunction) => {

    const state = getState()

    if (!state || !state.popupMenu) {
        return
    }

    const selectedIndex = index || state.popupMenu.selectedIndex
    const selectedOption = state.popupMenu.filteredOptions[selectedIndex]

    Events.events.emit("menu-item-selected:" + state.popupMenu.id, { selectedOption, openInSplit })

    dispatch(hidePopupMenu())
}

export const showQuickInfo = (filePath: string, line: number, column: number, title: string, description: string): Actions.IShowQuickInfoAction => ({
    type: "SHOW_QUICK_INFO",
    payload: {
        filePath: normalizePath(filePath),
        line,
        column,
        title,
        description,
    },
})

const _showAutoCompletion = (base: string, entries: Oni.Plugin.CompletionInfo[]) => ({
    type: "SHOW_AUTO_COMPLETION",
    payload: {
        base,
        entries,
    },
})

export const setDetailedCompletionEntry = (detailedEntry: Oni.Plugin.CompletionInfo) => ({
    type: "SET_AUTO_COMPLETION_DETAILS",
    payload: {
        detailedEntry,
    },
})

export const hideCompletions = () => ({ type: "HIDE_AUTO_COMPLETION" })

export const hideQuickInfo = () => ({ type: "HIDE_QUICK_INFO" })

export const hideCursorLine = () => ({ type: "HIDE_CURSOR_LINE" })

export const showCursorLine = () => ({ type: "SHOW_CURSOR_LINE" })

export const showCursorColumn = () => ({ type: "SHOW_CURSOR_COLUMN" })

export const hideCursorColumn = () => ({ type: "HIDE_CURSOR_COLUMN" })

export const setCursorLineOpacity = (opacity: number) => ({
    type: "SET_CURSOR_LINE_OPACITY",
    payload: {
        opacity,
    },
})

export const setCursorColumnOpacity = (opacity: number) => ({
    type: "SET_CURSOR_COLUMN_OPACITY",
    payload: {
        opacity,
    },
})

export function setConfigValue<K extends keyof IConfigurationValues>(k: K, v: IConfigurationValues[K]): Actions.ISetConfigurationValue<K> {
    return {
        type: "SET_CONFIGURATION_VALUE",
        payload: {
            key: k,
            value: v,
        },
    }
}

const _setCursorPosition = (cursorPixelX: any, cursorPixelY: any, fontPixelWidth: any, fontPixelHeight: any, cursorCharacter: string, cursorPixelWidth: number) => ({
    type: "SET_CURSOR_POSITION",
    payload: {
        pixelX: cursorPixelX,
        pixelY: cursorPixelY,
        fontPixelWidth,
        fontPixelHeight,
        cursorCharacter,
        cursorPixelWidth,
    },
})

const _setColors = (foregroundColor: string, backgroundColor: string) => ({
    type: "SET_COLORS",
    payload: { foregroundColor, backgroundColor },
})

const _nextAutoCompletion = () => ({
    type: "NEXT_AUTO_COMPLETION",
})

const _previousAutoCompletion = () => ({
    type: "PREVIOUS_AUTO_COMPLETION",
})
