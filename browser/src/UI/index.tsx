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

import { Observable } from "rxjs/Observable"
import { Subject } from "rxjs/Subject"

import { RootComponent } from "./RootComponent"

import * as ActionCreators from "./ActionCreators"
import { reducer } from "./Reducer"
import { getActiveDefinition } from "./selectors/DefinitionSelectors"
import * as State from "./State"

import { editorManager } from "./../Services/EditorManager"
import { focusManager } from "./../Services/FocusManager"
import { listenForDiagnostics } from "./../Services/Language"
import { windowManager } from "./../Services/WindowManager"

import { PluginManager } from "./../Plugins/PluginManager"

import { NeovimEditor } from "./../Editor/NeovimEditor"

import { createStore } from "./../Redux"

const defaultState = State.createDefaultState()

require("./components/common.less") // tslint:disable-line no-var-requires

export const store = createStore("SHELL", reducer, defaultState, [thunk])

const _state$: Subject<State.IState> = new Subject()
export const state$: Observable<State.IState> = _state$
store.subscribe(() => _state$.next(store.getState() as any))

export const Actions: typeof ActionCreators = bindActionCreators(ActionCreators as any, store.dispatch)

// TODO: Is there a helper utility like `bindActionCreators`, but for selectors?
export const Selectors = {
    getActiveDefinition: () => getActiveDefinition(store.getState() as any),
}

export function init(pluginManager: PluginManager, args: any): void {
    render(defaultState, pluginManager, args)
}

const updateViewport = () => {
    const width = document.body.offsetWidth
    const height = document.body.offsetHeight

    Actions.setViewport(width, height)
}

// TODO: WHy is this breaking?
window.setTimeout(() => {
    listenForDiagnostics()
})

window.addEventListener("resize", updateViewport)
updateViewport()

function render(_state: State.IState, pluginManager: PluginManager, args: any): void {
    const hostElement = document.getElementById("host")

    const editor = new NeovimEditor()
    editor.init(args)

    editorManager.setActiveEditor(editor)

    windowManager.split(0, editor)

    ReactDOM.render(
        <Provider store={store}>
            <RootComponent windowManager={windowManager}/>
        </Provider>, hostElement)
}

document.body.addEventListener("click", () => focusManager.enforceFocus())
