import * as React from "react"
import * as ReactDOM from "react-dom"

import { Provider } from "react-redux"
import { applyMiddleware, bindActionCreators, compose, createStore } from "redux"
import thunk from "redux-thunk"

import * as Config from "./../Config"

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

export function setBackgroundColor(backgroundColor: string): void {
    const config = Config.instance()
    const backgroundImageElement: HTMLElement = document.getElementsByClassName("background-image")[0] as HTMLElement
    const backgroundColorElement: HTMLElement = document.getElementsByClassName("background-cover")[0] as HTMLElement
    const backgroundImageUrl = config.getValue<string>("editor.backgroundImageUrl")
    const backgroundImageSize = config.getValue<string>("editor.backgroundImageSize") || "cover"

    backgroundImageElement.style.backgroundImage = "url(" + backgroundImageUrl + ")"
    backgroundImageElement.style.backgroundSize = backgroundImageSize
    backgroundColorElement.style.backgroundColor = backgroundColor
    backgroundColorElement.style.opacity = config.getValue<string>("editor.backgroundOpacity")
}

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
    const element = document.getElementById("overlay-ui")
    ReactDOM.render(
        <Provider store={store}>
            <RootComponent />
        </Provider>, element)
}
