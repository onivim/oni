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

export const events = Events.events

let defaultState = State.createDefaultState()

export function setBackgroundColor(backgroundColor: string): void {
    const config = Config.instance()
    const backgroundImageElement: HTMLElement = document.getElementsByClassName("background-image")[0] as HTMLElement
    const backgroundColorElement: HTMLElement = document.getElementsByClassName("background-cover")[0] as HTMLElement
    const backgroundImageUrl = config.getValue<string>("prototype.editor.backgroundImageUrl")
    const backgroundImageSize = config.getValue<string>("prototype.editor.backgroundImageSize") || "cover"

    backgroundImageElement.style.backgroundImage = "url(" + backgroundImageUrl + ")"
    backgroundImageElement.style.backgroundSize = backgroundImageSize
    backgroundColorElement.style.backgroundColor = backgroundColor
    backgroundColorElement.style.opacity = config.getValue<string>("prototype.editor.backgroundOpacity")
}

export function isPopupMenuOpen(): boolean {
    const popupMenu = store.getState().popupMenu
    return !!popupMenu
}

export function areCompletionsVisible(): boolean {
    const autoCompletion = store.getState().autoCompletion
    const entryCount = (autoCompletion && autoCompletion.entries) ? autoCompletion.entries.length : 0

    if (entryCount === 0) {
        return false
    }

    if (entryCount > 1) {
        return true
    }

    // In the case of a single entry, should not be visible if the base is equal to the selected item
    return autoCompletion != null && autoCompletion.base !== getSelectedCompletion()
}

export function getSelectedCompletion(): null | string {
    const autoCompletion = store.getState().autoCompletion
    return autoCompletion ? autoCompletion.entries[autoCompletion.selectedIndex].label : null
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
