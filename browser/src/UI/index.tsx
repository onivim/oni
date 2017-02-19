import { EventEmitter } from "events"
import * as React from "react"
import * as ReactDOM from "react-dom"

import { Provider } from "react-redux"
import { createStore } from "redux"

import * as Config from "./../Config"

import { RootComponent } from "./RootComponent"
import * as State from "./State"
import { Rectangle } from "./Types"

// import * as Actions from "./Actions"
import * as ActionCreators from "./ActionCreators"
import { reducer } from "./Reducer"

import { InstallHelp } from "./components/InstallHelp"

import { IScreen } from "./../Screen"

export const events = new EventEmitter()

let defaultState = State.createDefaultState()

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

// TODO: Can we use bindaction creators for this?
export function setActiveWindowDimensionsChanged(dimensions: Rectangle) {
    store.dispatch(ActionCreators.setActiveWindowDimensions(dimensions))
}

export function setCursorPosition(screen: IScreen): void {
    const cell = screen.getCell(screen.cursorColumn, screen.cursorRow)

    if (screen.cursorRow === screen.height - 1) {
        hideQuickInfo()
        hideSignatureHelp()
    }

    _setCursorPosition(screen.cursorColumn * screen.fontWidthInPixels, screen.cursorRow * screen.fontHeightInPixels, screen.fontWidthInPixels, screen.fontHeightInPixels, cell.character, cell.characterWidth * screen.fontWidthInPixels)
}

function _setCursorPosition(cursorPixelX: number, cursorPixelY: number, fontPixelWidth: number, fontPixelHeight: number, cursorCharacter: string, cursorPixelWidth: number): void {
    store.dispatch(ActionCreators.setCursorPosition(cursorPixelX, cursorPixelY, fontPixelWidth, fontPixelHeight, cursorCharacter, cursorPixelWidth))
}

// TODO: Can we use bindaction creators for this?
export function setMode(mode: string): void {
    store.dispatch(ActionCreators.setMode(mode))
}

export function setColors(foregroundColor: string): void {
    if (foregroundColor === store.getState().foregroundColor) {
        return
    }

    store.dispatch(ActionCreators.setColors(foregroundColor))
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
    const state = store.getState() as State.IState

    if (!state || !state.popupMenu) {
        return
    }

    const selectedIndex = state.popupMenu.selectedIndex // FIXME: null
    const selectedOption = state.popupMenu.filteredOptions[selectedIndex] // FIXME: null

    events.emit("menu-item-selected:" + state.popupMenu.id, { selectedOption, openInSplit })

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
        events.emit(CompletionItemSelectedEvent, entry)
    }
}

export function showNeovimInstallHelp(): void {
    const element = document.getElementById("overlay-ui")
    ReactDOM.render(<InstallHelp />, element)
}

const store = createStore(reducer, defaultState, window["__REDUX_DEVTOOLS_EXTENSION__"] && window["__REDUX_DEVTOOLS_EXTENSION__"]()) // tslint:disable-line no-string-literal

export function init(): void {
    render(defaultState)
}

export function showCursorLine(): void {
    store.dispatch(ActionCreators.showCursorLine())
}

export function hideCursorLine(): void {
    store.dispatch(ActionCreators.hideCursorLine())
}

export function showCursorColumn(): void {
    store.dispatch(ActionCreators.showCursorColumn())
}

export function hideCursorColumn(): void {
    store.dispatch(ActionCreators.hideCursorColumn())
}

function render(_state: State.IState): void {
    const element = document.getElementById("overlay-ui")
    ReactDOM.render(
        <Provider store={store}>
            <RootComponent />
        </Provider>, element)
}
