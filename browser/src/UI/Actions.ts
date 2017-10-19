/**
 * Action.ts
 *
 * Actions are simple payloads of information that send data from oni to the redux store.
 *
 * For information on Actions, check out this link:
 * http://redux.js.org/docs/basics/Actions.html
 */

import * as Coordinates from "./Coordinates"
import { IMessageDialog, ITab, StatusBarAlignment } from "./State"
import { Rectangle } from "./Types"

import { IConfigurationValues } from "./../Services/Configuration"

import * as types from "vscode-languageserver-types"

export interface ISetViewportAction {
    type: "SET_VIEWPORT",
    payload: {
        width: number,
        height: number,
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

export interface IBufferEnterAction {
    type: "BUFFER_ENTER",
    payload: {
        id: number,
        file: string,
        totalLines: number,
        hidden: boolean,
        listed: boolean,
    }
}

export interface IBufferUpdateAction {
    type: "BUFFER_UPDATE",
    payload: {
        id: number,
        modified: boolean,
        version: number,
        totalLines: number,
    }
}

export interface IBufferSaveAction {
    type: "BUFFER_SAVE",
    payload: {
        id: number,
        modified: boolean,
        version: number,
    }
}

export interface ISetTabs {
    type: "SET_TABS",
    payload: {
        selectedTabId: number
        tabs: ITab[],
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

export interface IClearErrorsAction {
    type: "CLEAR_ERRORS",
    payload: {
        file: string,
        key: string,
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

export interface IShowMessageDialog {
    type: "SHOW_MESSAGE_DIALOG",
    payload: IMessageDialog,
}

export interface IHideMessageDialog {
    type: "HIDE_MESSAGE_DIALOG"
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

export interface ISetColorsAction {
    type: "SET_COLORS",
    payload: {
        foregroundColor: string,
        backgroundColor: string,
    }
}

export interface IShowSignatureHelpAction {
    type: "SHOW_SIGNATURE_HELP",
    payload: {
        filePath: string,
        line: number,
        column: number,
        signatureHelp: types.SignatureHelp,
    }
}

export interface IShowQuickInfoAction {
    type: "SHOW_QUICK_INFO",
    payload: {
        filePath: string,
        line: number,
        column: number,
        title: string,
        description: string,
    }
}

export interface IShowAutoCompletionAction {
    type: "SHOW_AUTO_COMPLETION",
    payload: {
        base: string
        entries: Oni.Plugin.CompletionInfo[],
    }
}

export interface ISetAutoCompletionDetails {
    type: "SET_AUTO_COMPLETION_DETAILS",
    payload: {
        detailedEntry: Oni.Plugin.CompletionInfo,
    }
}

export interface IHideAutoCompletionAction {
    type: "HIDE_AUTO_COMPLETION"
}

export interface INextAutoCompletionAction {
    type: "NEXT_AUTO_COMPLETION"
}

export interface IPreviousAutoCompletionAction {
    type: "PREVIOUS_AUTO_COMPLETION"
}

export interface IHideQuickInfoAction {
    type: "HIDE_QUICK_INFO"
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
    IBufferEnterAction |
    IBufferSaveAction |
    IBufferUpdateAction |
    ISetCursorPositionAction |
    ISetImeActive |
    ISetFont |
    IShowSignatureHelpAction |
    IShowQuickInfoAction |
    IHideQuickInfoAction |
    IShowAutoCompletionAction |
    IHideAutoCompletionAction |
    INextAutoCompletionAction |
    IPreviousAutoCompletionAction |
    ISetAutoCompletionDetails |
    IShowMessageDialog |
    IHideMessageDialog |
    ISetModeAction |
    ISetColorsAction |
    IStatusBarHideAction |
    IStatusBarShowAction |
    ISetErrorsAction |
    IClearErrorsAction |
    ISetCurrentBuffersAction |
    ISetTabs |
    ISetViewportAction |
    ISetWindowCursor |
    ISetWindowState

export type ActionWithGeneric<K extends keyof IConfigurationValues> =
    ISetConfigurationValue<K>
