/**
 * UI/index.tsx
 *
 * Root setup & state for the UI
 * - Top-level render function lives here
 */

import * as React from "react"
import * as ReactDOM from "react-dom"

import { Provider } from "react-redux"
import { bindActionCreators } from "redux"
import thunk from "redux-thunk"

import { RootComponent } from "./RootComponent"

import * as ActionCreators from "./ActionCreators"
import { reducer } from "./Reducer"
import { getActiveDefinition } from "./selectors/DefinitionSelectors"
import * as State from "./State"

import { Colors } from "./../Services/Colors"
import { Configuration } from "./../Services/Configuration"
import { editorManager } from "./../Services/EditorManager"
import { focusManager } from "./../Services/FocusManager"
import { listenForDiagnostics } from "./../Services/Language"
import { SidebarSplit } from "./../Services/Sidebar"
import { windowManager } from "./../Services/WindowManager"

import { NeovimEditor } from "./../Editor/NeovimEditor"

import { createStore } from "./../Redux"

const defaultState = State.createDefaultState()

require("./components/common.less") // tslint:disable-line no-var-requires

export const store = createStore("SHELL", reducer, defaultState, [thunk])

export const Actions: typeof ActionCreators = bindActionCreators(ActionCreators as any, store.dispatch)

// TODO: Is there a helper utility like `bindActionCreators`, but for selectors?
export const Selectors = {
    getActiveDefinition: () => getActiveDefinition(store.getState() as any),
}

export const activate = (): void => {
    render(defaultState)
}

const updateViewport = () => {
    const width = document.body.offsetWidth
    const height = document.body.offsetHeight

    Actions.setViewport(width, height)
}

export const render = (_state: State.IState): void => {
    const hostElement = document.getElementById("host")

    ReactDOM.render(
        <Provider store={store}>
            <RootComponent windowManager={windowManager}/>
        </Provider>, hostElement)
}

export const startEditors = async (args: any, colors: Colors, configuration: Configuration): Promise<void> => {

    if (configuration.getValue("experimental.sidebar.enabled")) {
        const leftDock = windowManager.getDock(2)
        leftDock.addSplit(new SidebarSplit(colors))
    }

    const editor = new NeovimEditor(colors)
    editorManager.setActiveEditor(editor)
    windowManager.split(0, editor)

    await editor.init(args)
}

// Don't execute code that depends on DOM in unit-tests
if (global["window"]) { // tslint:disable-line
    updateViewport()

    // TODO: Why is this breaking?
    window.setTimeout(() => {
        listenForDiagnostics()
    })

    window.addEventListener("resize", updateViewport)

    document.body.addEventListener("click", () => focusManager.enforceFocus())
}
