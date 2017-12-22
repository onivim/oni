/**
 * ActionCreators.ts
 *
 * Action Creators are relatively simple - they are just a function that returns an `Action`
 *
 * For information on Action Creators, check out this link:
 * http://redux.js.org/docs/basics/Actions.html
 */

import * as types from "vscode-languageserver-types"

import * as isEqual from "lodash/isEqual"
import "rxjs/add/operator/distinctUntilChanged"
import { Subject } from "rxjs/Subject"

import * as Oni from "oni-api"

import { Rectangle } from "./Types"

import * as Actions from "./Actions"
import * as Coordinates from "./Coordinates"
import * as UI from "./index"
import * as State from "./State"

import { EventContext, InactiveBufferContext, IScreen } from "./../neovim"
import { normalizePath } from "./../Utility"

import { IConfigurationValues } from "./../Services/Configuration"
import { IThemeColors } from "./../Services/Themes"

export type DispatchFunction = (action: any) => void
export type GetStateFunction = () => State.IState

export const setHasFocus = (hasFocus: boolean) => {
    return {
        type: "SET_HAS_FOCUS",
        payload: {
            hasFocus,
        },
    }
}

export const setLoadingComplete = () => {

    document.body.classList.add("loaded")

    return {
        type: "SET_LOADING_COMPLETE",
    }
}

export const setWindowTitle = (title: string) => {

    document.title = title

    return {
        type: "SET_WINDOW_TITLE",
        payload: {
            title,
        },
    }
}

export const setColors = (colors: IThemeColors) => ({
    type: "SET_COLORS",
    payload: {
        colors,
    },
})

export const setCommandLinePosition = (position: number, level: number) => ({
    type: "SET_COMMAND_LINE_POSITION",
    payload: {
        position,
        level,
    },
})

export const hideCommandLine = () => ({
    type: "HIDE_COMMAND_LINE",
})

export const showCommandLine = (
    content: Array<[any, string]>,
    pos: number,
    firstchar: string,
    prompt: string,
    indent: number,
    level: number,
) => ({
    type: "SHOW_COMMAND_LINE",
    payload: {
        content,
        pos,
        firstchar,
        prompt,
        indent,
        level,
    },
})

export const setNeovimError = (neovimError: boolean) => ({
    type: "SET_NEOVIM_ERROR",
    payload: {
        neovimError,
    },
})

export const setViewport = (width: number, height: number) => ({
    type: "SET_VIEWPORT",
    payload: {
        width,
        height,
    },
})

export const setCursorScale = (cursorScale: number) => ({
    type: "SET_CURSOR_SCALE",
    payload: {
        cursorScale,
    },
})

const formatBuffers = (buffer: InactiveBufferContext & EventContext) => {
    return {
        id: buffer.bufferNumber,
        file: buffer.bufferFullPath ? normalizePath(buffer.bufferFullPath) : "",
        totalLines: buffer.bufferTotalLines ? buffer.bufferTotalLines : null,
        language: buffer.filetype,
        hidden: buffer.hidden,
        listed: buffer.listed,
    }
}

export const bufferEnter = (buffers: (Array<InactiveBufferContext | EventContext>)) => ({
    type: "BUFFER_ENTER",
    payload: {
        buffers: buffers.map(formatBuffers),
    },
})

export const bufferUpdate = (id: number, modified: boolean, totalLines: number) => ({
    type: "BUFFER_UPDATE",
    payload: {
        id,
        modified,
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

export const setWindowCursor = (windowId: number, line: number, column: number) => ({
    type: "SET_WINDOW_CURSOR",
    payload: {
        windowId,
        line,
        column,
    },
})

export const setWindowState = (windowId: number,
                               file: string,
                               column: number,
                               line: number,
                               bottomBufferLine: number,
                               topBufferLine: number,
                               dimensions: Rectangle,
                               bufferToScreen: Coordinates.BufferToScreen) => (dispatch: DispatchFunction, getState: GetStateFunction) => {

    const { fontPixelWidth, fontPixelHeight } = getState()

    const screenToPixel = (screenSpace: Coordinates.ScreenSpacePoint) => ({
            pixelX: screenSpace.screenX * fontPixelWidth,
            pixelY: screenSpace.screenY * fontPixelHeight,
    })

    dispatch({
        type: "SET_WINDOW_STATE",
        payload: {
            windowId,
            file: normalizePath(file),
            column,
            dimensions,
            line,
            bufferToScreen,
            screenToPixel,
            bottomBufferLine,
            topBufferLine,
        },
    })
}

export const showToolTip = (id: string, element: JSX.Element, options?: Oni.ToolTip.ToolTipOptions) => ({
    type: "SHOW_TOOL_TIP",
    payload: {
        id,
        element,
        options,
    },
})

export const hideToolTip = (id: string) => ({
    type: "HIDE_TOOL_TIP",
    payload: {
        id,
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

const $setCursorPosition = new Subject<any>()
$setCursorPosition
    .distinctUntilChanged(isEqual)
    .subscribe((action) => {
        UI.store.dispatch({
            type: "SET_CURSOR_POSITION",
            payload: action,
        })
    })

export const setCursorPosition = (screen: IScreen) => (dispatch: DispatchFunction) => {
    const cell = screen.getCell(screen.cursorColumn, screen.cursorRow)

    $setCursorPosition.next(_setCursorPosition(screen.cursorColumn * screen.fontWidthInPixels, screen.cursorRow * screen.fontHeightInPixels, screen.fontWidthInPixels, screen.fontHeightInPixels, cell.character, cell.characterWidth * screen.fontWidthInPixels).payload)
}

export const setMode = (mode: string) => ({
    type: "SET_MODE",
    payload: { mode },
})

export const setDefinition = (token: Oni.IToken, definitionLocation: types.Location): Actions.IShowDefinitionAction => ({
    type: "SHOW_DEFINITION",
    payload: {
        token,
        definitionLocation,
    },
})

export const hideDefinition = () => ({
    type: "HIDE_DEFINITION",
})

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
