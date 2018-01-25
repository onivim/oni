/**
 * UI/index.tsx
 *
 * Root setup & state for the UI
 * - Top-level render function lives here
 */

import * as React from "react"
import * as ReactDOM from "react-dom"
import { connect, Provider } from "react-redux"

import { remote } from "electron"

import { bindActionCreators } from "redux"
import thunk from "redux-thunk"

import { ShellView } from "./ShellView"

import * as ActionCreators from "./ShellActionCreators"
import { reducer } from "./ShellReducer"
import * as State from "./ShellState"

import { Colors } from "./../../Services/Colors"
import { focusManager } from "./../../Services/FocusManager"
import { windowManager } from "./../../Services/WindowManager"

import { createStore } from "./../../Redux"

const defaultState = State.createDefaultState()

export const store = createStore("Shell", reducer, defaultState, [thunk])

export const Actions: typeof ActionCreators = bindActionCreators(
    ActionCreators as any,
    store.dispatch,
)

const browserWindow = remote.getCurrentWindow()
browserWindow.on("enter-full-screen", () => {
    store.dispatch({ type: "ENTER_FULL_SCREEN" })
})

browserWindow.on("leave-full-screen", () => {
    store.dispatch({ type: "LEAVE_FULL_SCREEN" })
})

export const activate = (): void => {
    render(defaultState)
}

export const initializeColors = (colors: Colors): void => {
    const setColors = () => Actions.setColors(colors.getColors() as any)

    colors.onColorsChanged.subscribe(() => {
        setColors()
    })

    setColors()
}

const ShellContainer = connect((state: State.IState) => ({
    theme: state.colors,
}))(ShellView)

export const render = (state: State.IState): void => {
    const hostElement = document.getElementById("host")

    ReactDOM.render(
        <Provider store={store}>
            <ShellContainer windowManager={windowManager} />
        </Provider>,
        hostElement,
    )
}

// Don't execute code that depends on DOM in unit-tests
if (global["window"]) {
    // tslint:disable-line
    document.body.addEventListener("click", () => focusManager.enforceFocus())
}
