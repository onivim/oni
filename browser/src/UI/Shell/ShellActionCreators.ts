/**
 * ActionCreators.ts
 *
 * Action Creators are relatively simple - they are just a function that returns an `Action`
 *
 * For information on Action Creators, check out this link:
 * http://redux.js.org/docs/basics/Actions.html
 */

import * as Log from "oni-core-logging"

import { IConfigurationValues } from "./../../Services/Configuration"
import { IThemeColors } from "./../../Services/Themes"

import * as Actions from "./ShellActions"
import * as State from "./ShellState"

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

export const setViewport = (width: number, height: number) => ({
    type: "SET_VIEWPORT",
    payload: {
        width,
        height,
    },
})

export const showStatusBarItem = (
    id: string,
    contents: JSX.Element,
    alignment?: State.StatusBarAlignment,
    priority?: number,
) => (dispatch: DispatchFunction, getState: GetStateFunction) => {
    const currentStatusBarItem = getState().statusBar[id]

    if (currentStatusBarItem) {
        alignment = alignment || currentStatusBarItem.alignment
        priority = priority || currentStatusBarItem.priority
    }

    Log.info(
        "Showing statusbar item: " +
            JSON.stringify({
                id,
                contents,
                alignment,
                priority,
            }),
    )

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

export const showOverlay = (id: string, contents: JSX.Element): Actions.IOverlayShowAction => ({
    type: "OVERLAY_SHOW",
    payload: {
        id,
        contents,
    },
})

export const hideOverlay = (id: string): Actions.IOverlayHideAction => ({
    type: "OVERLAY_HIDE",
    payload: {
        id,
    },
})

export function setConfigValue<K extends keyof IConfigurationValues>(
    k: K,
    v: IConfigurationValues[K],
): Actions.ISetConfigurationValue<K> {
    return {
        type: "SET_CONFIGURATION_VALUE",
        payload: {
            key: k,
            value: v,
        },
    }
}
