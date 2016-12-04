import { EventEmitter } from "events"
import * as React from "react"
import * as ReactDOM from "react-dom"

import { createStore } from "redux"
import { Provider } from "react-redux"

import * as Config from "./../Config"

import * as State from "./State"
import { RootComponent } from "./RootComponent"

// import * as Actions from "./Actions"
import * as ActionCreators from "./ActionCreators"
import { reducer } from "./Reducer"

import { InstallHelp } from "./components/InstallHelp"

export const events = new EventEmitter()

let state: State.IState = {
    cursorPixelX: 10,
    cursorPixelY: 10,
    fontPixelWidth: 10,
    fontPixelHeight: 10,
    autoCompletion: null,
    quickInfo: null,
    popupMenu: null,
    signatureHelp: null
}

const CompletionItemSelectedEvent = "completion-item-selected"

export function setBackgroundColor(backgroundColor: string): void {
    const backgroundImageElement: HTMLElement = document.getElementsByClassName("background-image")[0] as HTMLElement
    const backgroundColorElement: HTMLElement = document.getElementsByClassName("background-cover")[0] as HTMLElement
    const backgroundImageUrl = Config.getValue<string>("prototype.editor.backgroundImageUrl")
    const backgroundImageSize = Config.getValue<string>("prototype.editor.backgroundImageSize") || "cover"

    backgroundImageElement.style.backgroundImage = "url(" + backgroundImageUrl + ")"
    backgroundImageElement.style.backgroundSize = backgroundImageSize
    backgroundColorElement.style.backgroundColor = backgroundColor
    backgroundColorElement.style.opacity = Config.getValue<string>("prototype.editor.backgroundOpacity")
}

export function setCursorPosition(cursorPixelX: number, cursorPixelY: number, fontPixelWidth: number, fontPixelHeight: number): void {
    store.dispatch(ActionCreators.setCursorPosition(cursorPixelX, cursorPixelY, fontPixelWidth, fontPixelHeight))
}

export function showSignatureHelp(help: Oni.Plugin.SignatureHelpResult): void {
    store.dispatch(ActionCreators.showSignatureHelp(help))
}

export function hideSignatureHelp(): void {
    store.dispatch(ActionCreators.hideSignatureHelp())
}

export function showPopupMenu(id: string, options: Oni.Menu.MenuOption[]): void {
    store.dispatch(ActionCreators.showMenu(id, options))
}

export function hidePopupMenu(): void {
    store.dispatch(ActionCreators.hideMenu())
}

export function isPopupMenuOpen(): boolean {
    const popupMenu = store.getState().popupMenu
    return !!popupMenu
}

export function nextPopupMenuItem(): void {
    store.dispatch(ActionCreators.nextMenu())
}

export function previousPopupMenuItem(): void {
    store.dispatch(ActionCreators.previousMenu())
}

export function selectPopupMenuItem(openInSplit: boolean): void {
    const selectedIndex = (store.getState().popupMenu as any).selectedIndex // FIXME: null
    const selectedOption = (store.getState().popupMenu as any).filteredOptions[selectedIndex] // FIXME: null

    events.emit("menu-item-selected", {
        selectedOption: selectedOption,
        openInSplit: openInSplit
    })

    hidePopupMenu()
}

export function showQuickInfo(title: string, description: string): void {
    store.dispatch(ActionCreators.showQuickInfo(title, description))
}

export function hideQuickInfo(): void {
    store.dispatch(ActionCreators.hideQuickInfo())
}

export function areCompletionsVisible(): boolean {
    const autoCompletion = store.getState().autoCompletion
    const entryCount = (autoCompletion && autoCompletion.entries) ? autoCompletion.entries.length : 0

    if (entryCount === 0)
        return false

    if (entryCount > 1)
        return true

    // In the case of a single entry, should not be visible if the base is equal to the selected item
    return autoCompletion != null && autoCompletion.base !== getSelectedCompletion()
}

export function getSelectedCompletion(): null | string {
    const autoCompletion = store.getState().autoCompletion
    return autoCompletion ? autoCompletion.entries[autoCompletion.selectedIndex].label : null;
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
        events.emit(CompletionItemSelectedEvent, entry)
    }
}

export function showNeovimInstallHelp(): void {
    const element = document.getElementById("overlay-ui")
    ReactDOM.render(<InstallHelp />, element)
}

const store = createStore(reducer, state)

export function init(): void {
    render(state)
}

function render(_state: State.IState): void {
    const element = document.getElementById("overlay-ui")
    ReactDOM.render(
        <Provider store={store}>
            <RootComponent />
        </Provider>, element)
}
