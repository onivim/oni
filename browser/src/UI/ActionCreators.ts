/**
 * ActionCreators.ts
 *
 * Action Creators are relatively simple - they are just a function that returns an `Action`
 *
 * For information on Action Creators, check out this link:
 * http://redux.js.org/docs/basics/Actions.html
 */

import * as Events from "./Events"
import { Rectangle } from "./Types"

import { IScreen } from "./../Screen"

import * as State from "./State"

import { events } from "./Events"

export const showCompletions = (result: Oni.Plugin.CompletionResult) => (dispatch: Function, getState: Function) => {
    dispatch(_showAutoCompletion(result.base, result.completions))

    if (result.completions.length > 0) {
        emitCompletionItemSelectedEvent(getState())
    }
}

export const previousCompletion = () => (dispatch: Function, getState: Function) => {
    dispatch(_previousAutoCompletion())

    emitCompletionItemSelectedEvent(getState())
}

export const nextCompletion = () => (dispatch: Function, getState: Function) => {
    dispatch(_nextAutoCompletion())

    emitCompletionItemSelectedEvent(getState())
}

function emitCompletionItemSelectedEvent(state: State.IState): void {
    const autoCompletion = state.autoCompletion
    if (autoCompletion != null) {
        const entry = autoCompletion.entries[autoCompletion.selectedIndex]
        events.emit(Events.CompletionItemSelectedEvent, entry)
    }
}

export const setCursorPosition = (screen: IScreen) => (dispatch: Function) => {
    const cell = screen.getCell(screen.cursorColumn, screen.cursorRow)

    if (screen.cursorRow === screen.height - 1) {
        dispatch(hideQuickInfo())
        dispatch(hideSignatureHelp())
    }

    dispatch(_setCursorPosition(screen.cursorColumn * screen.fontWidthInPixels, screen.cursorRow * screen.fontHeightInPixels, screen.fontWidthInPixels, screen.fontHeightInPixels, cell.character, cell.characterWidth * screen.fontWidthInPixels))
}

export const setColors = (foregroundColor: string) => (dispatch: Function, getState: Function) => {
    if (foregroundColor === getState().foregroundColor) {
        return
    }

    dispatch(_setColors(foregroundColor))
}

export const setActiveWindowDimensions = (dimensions: Rectangle) => ({
    type: "SET_ACTIVE_WINDOW_DIMENSIONS",
    payload: { dimensions },
})

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

export const selectMenuItem = (openInSplit: boolean, index?: number) => (dispatch: Function, getState: Function) => {

    const state = getState()

    if (!state || !state.popupMenu) {
        return
    }

    const selectedIndex = index || state.popupMenu.selectedIndex
    const selectedOption = state.popupMenu.filteredOptions[selectedIndex]

    Events.events.emit("menu-item-selected:" + state.popupMenu.id, { selectedOption, openInSplit })

    dispatch(hidePopupMenu())
}

export const showQuickInfo = (title: string, description: string) => ({
    type: "SHOW_QUICK_INFO",
    payload: {
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

const _setColors = (foregroundColor: string) => ({
    type: "SET_COLORS",
    payload: { foregroundColor },
})

const _nextAutoCompletion = () => ({
    type: "NEXT_AUTO_COMPLETION",
})

const _previousAutoCompletion = () => ({
    type: "PREVIOUS_AUTO_COMPLETION",
})
