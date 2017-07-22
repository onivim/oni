import * as React from "react"
import * as ReactDOM from "react-dom"

import { Provider } from "react-redux"
import { applyMiddleware, bindActionCreators, compose, createStore } from "redux"
import thunk from "redux-thunk"

import { RootComponent } from "./RootComponent"

// import * as Actions from "./Actions"
import * as ActionCreators from "./ActionCreators"
import * as Events from "./Events"
import { reducer } from "./Reducer"
import * as UnboundSelectors from "./Selectors"
import * as State from "./State"

import { PluginManager } from "./../Plugins/PluginManager"
import { CommandManager } from "./../Services/CommandManager"

import { NeovimEditor } from "./../Editor/NeovimEditor"

export const events = Events.events

let defaultState = State.createDefaultState()

require("./components/common.less") // tslint:disable-line no-var-requires

const composeEnhancers = window["__REDUX_DEVTOOLS_EXTENSION__COMPOSE__"] || compose // tslint:disable-line no-string-literal
const enhancer = composeEnhancers(
    applyMiddleware(thunk),
)

export const store = createStore(reducer, defaultState, enhancer)

export const Actions: typeof ActionCreators = bindActionCreators(ActionCreators as any, store.dispatch)

// TODO: Is there a helper utility like `bindActionCreators`, but for selectors?
export const Selectors = {
    isPopupMenuOpen: () => UnboundSelectors.isPopupMenuOpen(store.getState() as any),
    areCompletionsVisible: () => UnboundSelectors.areCompletionsVisible(store.getState() as any),
    getSelectedCompletion: () => UnboundSelectors.getSelectedCompletion(store.getState() as any),
}

export function init(pluginManager: PluginManager, commandManager: CommandManager, args: any): void {
    render(defaultState, pluginManager, commandManager, args)
}

function render(_state: State.IState, pluginManager: PluginManager, commandManager: CommandManager, args: any): void {
    const hostElement = document.getElementById("host")

    const editor = new NeovimEditor(commandManager, pluginManager)
    editor.init(args)

    ReactDOM.render(
        <Provider store={store}>
            <RootComponent editor={editor} />
        </Provider>, hostElement)
}

if (process.env.NODE_ENV === "development") {
    const Perf = require("react-addons-perf") // tslint:disable-line no-var-requires
    window["ReactPerf"] = Perf // tslint:disable-line no-string-literal
}
