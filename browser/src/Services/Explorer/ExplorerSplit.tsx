/**
 * ExplorerSplit.tsx
 *
 */

import * as path from "path"

import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"

import * as Oni from "oni-api"
import { Event } from "oni-types"

import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

import { CallbackCommand, CommandManager } from "./../../Services/CommandManager"
import { EditorManager } from "./../../Services/EditorManager"

// import { Colors } from "./../Colors"

import { createStore, IExplorerState } from "./ExplorerStore"
// import { Sidebar } from "./SidebarView"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { Explorer } from "./ExplorerView"

export class ExplorerSplit {

    private _onEnterEvent: Event<void> = new Event<void>()

    // private _activeBinding: IMenuBinding = null
    private _activeBinding: IMenuBinding = null
    private _store: Store<IExplorerState>

    constructor(
        private _workspace: Oni.Workspace,
        private _commandManager: CommandManager,
        private _editorManager: EditorManager,
    ) {
        this._store = createStore()

        this._workspace.onDirectoryChanged.subscribe((newDirectory) => {
            this._store.dispatch({
                type: "SET_ROOT_DIRECTORY",
                rootPath: newDirectory,
            })
        })
    }

    public enter(): void {

        this._commandManager.registerCommand(new CallbackCommand("explorer.open", null, null, () => this._onOpenItem()))

        this._onEnterEvent.dispatch()

        this._activeBinding = getInstance().bindToMenu()

        const state = this._store.getState()

        const flattenedState = ExplorerSelectors.mapStateToNodeList(state)

        const items = flattenedState.map((fs) => fs.id)

        this._activeBinding.setItems(items)

        this._activeBinding.onCursorMoved.subscribe((id: string) => {
            this._store.dispatch({
                type: "SET_SELECTED_ID",
                selectedId: id,
            })
        })
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

                const fullPath = path.join(state.rootFolder.fullPath, selectedItem.filePath)
                this._editorManager.activeEditor.openFile(fullPath)
                return
            default:
                alert("Not implemented yet.") // tslint:disable-line
        }
    }

    public leave(): void {
        if (this._activeBinding) {
            this._activeBinding.release()
            this._activeBinding = null
        }

        this._commandManager.unregisterCommand("explorer.open")
    }

    public render(): JSX.Element {

        return <Provider store={this._store}>
                <Explorer onEnter={this._onEnterEvent} onKeyDown={(key: string) => this._onKeyDown(key)}/>
            </Provider>
    }

    private _onKeyDown(key: string): void {
        if (this._activeBinding) {
            this._activeBinding.input(key)
        }
    }
}
