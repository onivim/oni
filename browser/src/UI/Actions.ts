/**
 * Action.ts
 *
 * Actions are simple payloads of information that send data from oni to the redux store.
 *
 * For information on Actions, check out this link:
 * http://redux.js.org/docs/basics/Actions.html
 */

import * as Oni from "oni-api"

import * as Coordinates from "./Coordinates"
import { StatusBarAlignment } from "./State"
import { Rectangle } from "./Types"

import { IConfigurationValues } from "./../Services/Configuration"
import { IThemeColors } from "./../Services/Themes"

import * as types from "vscode-languageserver-types"

export interface ISetHasFocusAction {
    type: "SET_HAS_FOCUS",
    payload: {
        hasFocus: boolean,
    }
}

export interface IEnterFullScreenAction {
    type: "ENTER_FULL_SCREEN",
}

export interface ILeaveFullScreenAction {
    type: "LEAVE_FULL_SCREEN",
}

export interface ISetLoadingCompleteAction {
    type: "SET_LOADING_COMPLETE",
}

export interface ISetWindowTitleAction {
    type: "SET_WINDOW_TITLE",
    payload: {
        title: string,
    }
}

export interface ISetColorsAction {
    type: "SET_COLORS",
    payload: {
        colors: IThemeColors,
    }
}

export interface ISetViewportAction {
    type: "SET_VIEWPORT",
    payload: {
        width: number,
        height: number,
    }
}

export interface ISetNeovimErrorAction {
    type: "SET_NEOVIM_ERROR",
    payload: {
        neovimError: boolean,
    }
}

export interface ISetCursorScaleAction {
    type: "SET_CURSOR_SCALE",
    payload: {
        cursorScale: number,
    }
}

export interface ISetCurrentBuffersAction {
    type: "SET_CURRENT_BUFFERS",
    payload: {
        bufferIds: number[],
    }
}

export interface ISetImeActive {
    type: "SET_IME_ACTIVE",
    payload: {
        imeActive: boolean,
    }
}

export interface ISetFont {
    type: "SET_FONT",
    payload: {
        fontFamily: string,
        fontSize: string,
    }
}

export interface IShowToolTipAction {
    type: "SHOW_TOOL_TIP",
    payload: {
        id: string,
        element: JSX.Element,
        options?: Oni.ToolTip.ToolTipOptions,
    }
}

export interface IHideToolTipAction {
    type: "HIDE_TOOL_TIP",
    payload: {
        id: string,
    }
}

export interface ISetWindowCursor {
    type: "SET_WINDOW_CURSOR",
    payload: {
        windowId: number,
        line: number,
        column: number,
    },
}

export interface ISetWindowState {
    type: "SET_WINDOW_STATE",
    payload: {
        windowId: number,
        file: string,
        column: number,
        line: number,

        dimensions: Rectangle

        bufferToScreen: Coordinates.BufferToScreen
        screenToPixel: Coordinates.ScreenToPixel

        topBufferLine: number
        bottomBufferLine: number,
    }
}

export interface ISetErrorsAction {
    type: "SET_ERRORS",
    payload: {
        file: string,
        key: string,
        errors: types.Diagnostic[],
    }
}

export interface ISetCursorPositionAction {
    type: "SET_CURSOR_POSITION",
    payload: {
        pixelX: number,
        pixelY: number,
        fontPixelWidth: number,
        fontPixelHeight: number,
        cursorCharacter: string,
        cursorPixelWidth: number,
    }
}

export interface IStatusBarShowAction {
    type: "STATUSBAR_SHOW",
    payload: {
        id: string,
        contents: JSX.Element,
        alignment: StatusBarAlignment,
        priority: number,
    }
}

export interface IStatusBarHideAction {
    type: "STATUSBAR_HIDE",
    payload: {
        id: string,
    }
}

export interface ISetModeAction {
    type: "SET_MODE",
    payload: {
        mode: string,
    }
}

export interface IShowDefinitionAction {
    type: "SHOW_DEFINITION",
    payload: {
        token: Oni.IToken,
        definitionLocation: types.Location,
    }
}

export interface IHideDefinitionAction {
    type: "HIDE_DEFINITION",
}

export interface ISetConfigurationValue<K extends keyof IConfigurationValues> {
    type: "SET_CONFIGURATION_VALUE"
    payload: {
        key: K,
        value: IConfigurationValues[K],
    }
}

export type Action<K extends keyof IConfigurationValues> =
    SimpleAction | ActionWithGeneric<K>

export type SimpleAction =
    IEnterFullScreenAction |
    ILeaveFullScreenAction |
    ISetColorsAction |
    ISetCursorPositionAction |
    ISetImeActive |
    ISetFont |
    IHideToolTipAction |
    IShowToolTipAction |
    IHideDefinitionAction |
    IShowDefinitionAction |
    ISetModeAction |
    ISetCursorScaleAction |
    IStatusBarHideAction |
    IStatusBarShowAction |
    ISetErrorsAction |
    ISetCurrentBuffersAction |
    ISetHasFocusAction |
    ISetNeovimErrorAction |
    ISetLoadingCompleteAction |
    ISetViewportAction |
    ISetWindowCursor |
    ISetWindowState |
    ISetWindowTitleAction

export type ActionWithGeneric<K extends keyof IConfigurationValues> =
    ISetConfigurationValue<K>
