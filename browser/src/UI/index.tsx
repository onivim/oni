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

import { IScreen } from "./../Screen"

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

export function setCursorPosition(screen: IScreen): void {
    const cell = screen.getCell(screen.cursorColumn, screen.cursorRow)

    if (screen.cursorRow === screen.height - 1) {
        Actions.hideQuickInfo()
        Actions.hideSignatureHelp()
    }

    _setCursorPosition(screen.cursorColumn * screen.fontWidthInPixels, screen.cursorRow * screen.fontHeightInPixels, screen.fontWidthInPixels, screen.fontHeightInPixels, cell.character, cell.characterWidth * screen.fontWidthInPixels)
}

export function isPopupMenuOpen(): boolean {
    const popupMenu = store.getState().popupMenu
    return !!popupMenu
}

function _setCursorPosition(cursorPixelX: number, cursorPixelY: number, fontPixelWidth: number, fontPixelHeight: number, cursorCharacter: string, cursorPixelWidth: number): void {
    store.dispatch(ActionCreators.setCursorPosition(cursorPixelX, cursorPixelY, fontPixelWidth, fontPixelHeight, cursorCharacter, cursorPixelWidth))
}

export function setColors(foregroundColor: string): void {
    if (foregroundColor === store.getState().foregroundColor) {
        return
    }

    store.dispatch(ActionCreators.setColors(foregroundColor))
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

export function showCompletions(result: Oni.Plugin.CompletionResult): void {
    store.dispatch(ActionCreators.showAutoCompletion(result.base, result.completions))

    // TODO: Figure out why this isn't working
    if (result.completions.length > 0) {
        emitCompletionItemSelectedEvent()
    }
}

export function setDetailedCompletionEntry(detailedEntry: Oni.Plugin.CompletionInfo): void {
    store.dispatch(ActionCreators.setAutoCompletionDetails(detailedEntry))
}

export function hideCompletions(): void {
    store.dispatch(ActionCreators.hideAutoCompletion())
}

export function nextCompletion(): void {
    store.dispatch(ActionCreators.nextAutoCompletion())

    emitCompletionItemSelectedEvent()
}

export function previousCompletion(): void {
    store.dispatch(ActionCreators.previousAutoCompletion())

    emitCompletionItemSelectedEvent()
}

function emitCompletionItemSelectedEvent(): void {
    const autoCompletion = store.getState().autoCompletion
    if (autoCompletion != null) {
        const entry = autoCompletion.entries[autoCompletion.selectedIndex]
        events.emit(Events.CompletionItemSelectedEvent, entry)
    }
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
