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

import { RootComponent } from "./RootComponent"

import * as ActionCreators from "./ActionCreators"
import { reducer } from "./Reducer"
import * as State from "./State"

import { focusManager } from "./../Services/FocusManager"
import { windowManager } from "./../Services/WindowManager"

import { createStore } from "./../Redux"

const defaultState = State.createDefaultState()

require("./components/common.less") // tslint:disable-line no-var-requires

export const store = createStore("SHELL", reducer, defaultState, [thunk])

export const Actions: typeof ActionCreators = bindActionCreators(ActionCreators as any, store.dispatch)

const browserWindow = remote.getCurrentWindow()
browserWindow.on("enter-full-screen", () => {
    store.dispatch({type: "ENTER_FULL_SCREEN"})
})

browserWindow.on("leave-full-screen", () => {
    store.dispatch({type: "LEAVE_FULL_SCREEN"})
})

export const activate = (): void => {
    render(defaultState)
}

const RootContainer = connect((state: State.IState) => ({
    theme: state.colors,
}))(RootComponent)

export const render = (state: State.IState): void => {
    const hostElement = document.getElementById("host")

    ReactDOM.render(
        <Provider store={store}>
            <RootContainer windowManager={windowManager}/>
        </Provider>, hostElement)
}

// Don't execute code that depends on DOM in unit-tests
if (global["window"]) { // tslint:disable-line
    document.body.addEventListener("click", () => focusManager.enforceFocus())
}
