/**
 * Action.ts
 *
 * Actions are simple payloads of information that send data from oni to the redux store.
 *
 * For information on Actions, check out this link:
 * http://redux.js.org/docs/basics/Actions.html
 */

import { IConfigurationValues } from "./../../Services/Configuration"
import { IThemeColors } from "./../../Services/Themes"

import { StatusBarAlignment } from "./ShellState"

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
    IStatusBarHideAction |
    IStatusBarShowAction |
    ISetHasFocusAction |
    ISetLoadingCompleteAction |
    ISetWindowTitleAction

export type ActionWithGeneric<K extends keyof IConfigurationValues> =
    ISetConfigurationValue<K>
