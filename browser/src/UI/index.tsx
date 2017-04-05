import * as React from "react"
import * as ReactDOM from "react-dom"

import { Provider } from "react-redux"
import { applyMiddleware, bindActionCreators, compose, createStore } from "redux"
import thunk from "redux-thunk"

import { Background } from "./components/Background"
import { RootComponent } from "./RootComponent"
import * as State from "./State"

// import * as Actions from "./Actions"
import * as ActionCreators from "./ActionCreators"
import { reducer } from "./Reducer"

import { InstallHelp } from "./components/InstallHelp"

import * as Events from "./Events"
import * as UnboundSelectors from "./Selectors"

export const events = Events.events

let defaultState = State.createDefaultState()

export function showNeovimInstallHelp(): void {
    const element = document.getElementById("overlay-ui")
    ReactDOM.render(<InstallHelp />, element)
}

const composeEnhancers = window["__REDUX_DEVTOOLS_EXTENSION__COMPOSE__"] || compose // tslint:disable-line no-string-literal
const enhancer = composeEnhancers(
    applyMiddleware(thunk),
)

const store = createStore(reducer, defaultState, enhancer)

export const Actions = bindActionCreators(ActionCreators as any, store.dispatch)

// TODO: Is there a helper utility like `bindActionCreators`, but for selectors?
export const Selectors = {
    isPopupMenuOpen: () => UnboundSelectors.isPopupMenuOpen(store.getState()),
    areCompletionsVisible: () => UnboundSelectors.areCompletionsVisible(store.getState()),
    getSelectedCompletion: () => UnboundSelectors.getSelectedCompletion(store.getState()),
}

export function init(): void {
    render(defaultState)
}

function render(_state: State.IState): void {
    const uiElement = document.getElementById("overlay-ui")
    const backgroundElement = document.getElementById("background")
    ReactDOM.render(
        <Provider store={store}>
            <RootComponent />
        </Provider>, uiElement)
    ReactDOM.render(
        <Provider store={store}>
            <Background />
        </Provider>, backgroundElement)
}
