/**
 * Reducer.ts
 *
 * Top-level reducer for UI state transforms
 */

import { IConfigurationValues } from "./../../Services/Configuration"

import * as Actions from "./ShellActions"
import * as State from "./ShellState"

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
        case "SET_CONFIGURATION_VALUE":
            const obj: Partial<IConfigurationValues> = {}
            obj[a.payload.key] = a.payload.value
            const newConfig = {...s.configuration, ...obj}
            return {...s,
                    configuration: newConfig}
        default:
            return {...s,
                    statusBar: statusBarReducer(s.statusBar, a),
                    }
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
