/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"

import * as Oni from "oni-api"
import { Event } from "oni-types"

import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

import { CallbackCommand, CommandManager } from "./../../Services/CommandManager"
import { Configuration } from "./../../Services/Configuration"
import { EditorManager } from "./../../Services/EditorManager"

import { createStore, IExplorerState } from "./ExplorerStore"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { Explorer } from "./ExplorerView"

export class ExplorerSplit {

    private _onEnterEvent: Event<void> = new Event<void>()

    // private _activeBinding: IMenuBinding = null
    private _activeBinding: IMenuBinding = null
    private _store: Store<IExplorerState>
    private _lastState: IExplorerState = null

    public get id(): string {
        return "oni.sidebar.explorer"
    }

    public get title(): string {
        return "Explorer"
    }

    constructor(
        private _configuration: Configuration,
        private _workspace: Oni.Workspace,
        private _commandManager: CommandManager,
        private _editorManager: EditorManager,
    ) {
        this._store = createStore()

        this._store.dispatch({
            type: "SET_FONT",
            fontFamily: this._configuration.getValue<string>("ui.fontFamily"),
            fontSize: this._configuration.getValue<string>("ui.fontSize"),
        })

        this._workspace.onDirectoryChanged.subscribe((newDirectory) => {
            this._store.dispatch({
                type: "SET_ROOT_DIRECTORY",
                rootPath: newDirectory,
            })
        })

        this._editorManager.allEditors.onBufferEnter.subscribe((args) => {
            this._store.dispatch({
                type: "BUFFER_OPENED",
                filePath: args.filePath,
            })
        })

        this._store.subscribe(() => this._updateBindingFromState())
    }

    public enter(): void {

        this._store.dispatch({type: "ENTER"})
        this._commandManager.registerCommand(new CallbackCommand("explorer.open", null, null, () => this._onOpenItem()))

        this._onEnterEvent.dispatch()

        this._activeBinding = getInstance().bindToMenu()

        this._updateBindingFromState()

        this._activeBinding.onCursorMoved.subscribe((id: string) => {

            if (id === this._store.getState().selectedId) {
                return
            }

            this._store.dispatch({
                type: "SET_SELECTED_ID",
                selectedId: id,
            })
        })
    }

    public leave(): void {
        if (this._activeBinding) {
            this._activeBinding.release()
            this._activeBinding = null
        }

        this._store.dispatch({type: "LEAVE"})

        this._commandManager.unregisterCommand("explorer.open")
    }

    public render(): JSX.Element {

        return <Provider store={this._store}>
                <Explorer onEnter={this._onEnterEvent} onKeyDown={(key: string) => this._onKeyDown(key)}/>
            </Provider>
    }

    private _updateBindingFromState(): void {

        if (!this._activeBinding) {
            return
        }

        const state = this._store.getState()

        if (this._lastState === state) {
            return
        }

        this._lastState = state
        const flattenedState = ExplorerSelectors.mapStateToNodeList(state)
        const items = flattenedState.map((fs) => fs.id)
        this._activeBinding.setItems(items, state.selectedId)
    }

    private _onOpenItem(): void {
        const state = this._store.getState()
        const flattenedState = ExplorerSelectors.mapStateToNodeList(state)

        const selectedId = state.selectedId

        const selectedItem = flattenedState.find((item) => item.id === selectedId)

        if (!selectedItem) {
            return
        }

        switch (selectedItem.type) {
            case "file":
                this._editorManager.activeEditor.openFile(selectedItem.filePath)
                return
            case "folder":
                const isDirectoryExpanded = ExplorerSelectors.isPathExpanded(state, selectedItem.folderPath)
                this._store.dispatch({
                    type: isDirectoryExpanded ? "COLLAPSE_DIRECTORY" : "EXPAND_DIRECTORY",
                    directoryPath: selectedItem.folderPath,
                })
                return
            default:
                alert("Not implemented yet.") // tslint:disable-line
        }
    }

    private _onKeyDown(key: string): void {
        if (this._activeBinding) {
            this._activeBinding.input(key)
        }
    }
}
