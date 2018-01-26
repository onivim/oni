/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"

import { Event } from "oni-types"

// import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

import { CallbackCommand, CommandManager } from "./../../Services/CommandManager"
// import { Configuration } from "./../../Services/Configuration"
import { EditorManager } from "./../../Services/EditorManager"
import { IWorkspace } from "./../../Services/Workspace"
import { windowManager } from "./../../Services/WindowManager"

import { createStore, IExplorerState } from "./ExplorerStore"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { Explorer } from "./ExplorerView"

import { rm } from "shelljs"

export class ExplorerSplit {
    private _onEnterEvent: Event<void> = new Event<void>()
    private _selectedId: string = null

    private _store: Store<IExplorerState>

    public get id(): string {
        return "oni.sidebar.explorer"
    }

    public get title(): string {
        return "Explorer"
    }

    constructor(
        // private _configuration: Configuration,
        private _workspace: IWorkspace,
        private _commandManager: CommandManager,
        private _editorManager: EditorManager,
    ) {
        this._store = createStore()

        this._workspace.onDirectoryChanged.subscribe(newDirectory => {
            this._store.dispatch({
                type: "SET_ROOT_DIRECTORY",
                rootPath: newDirectory,
            })
        })

        if (this._workspace.activeWorkspace) {
            this._store.dispatch({
                type: "SET_ROOT_DIRECTORY",
                rootPath: this._workspace.activeWorkspace,
            })
        }

        this._editorManager.allEditors.onBufferEnter.subscribe(args => {
            this._store.dispatch({
                type: "BUFFER_OPENED",
                filePath: args.filePath,
            })
        })
    }

    public enter(): void {
        this._store.dispatch({ type: "ENTER" })
        this._commandManager.registerCommand(
            new CallbackCommand("explorer.open", null, null, () => this._onOpenItem()),
        )
        this._commandManager.registerCommand(
            new CallbackCommand("explorer.delete", null, null, () => this._onDeleteItem()),
        )

        this._onEnterEvent.dispatch()
    }

    public leave(): void {
        this._store.dispatch({ type: "LEAVE" })

        this._commandManager.unregisterCommand("explorer.open")
        this._commandManager.unregisterCommand("explorer.delete")
    }

    public render(): JSX.Element {
        return (
            <Provider store={this._store}>
                <Explorer
                    onSelectionChanged={id => this._onSelectionChanged(id)}
                    onClick={id => this._onOpenItem(id)}
                />
            </Provider>
        )
    }

    private _onSelectionChanged(id: string): void {
        this._selectedId = id
    }

    private _onOpenItem(id?: string): void {
        const selectedItem = this._getSelectedItem(id)

        if (!selectedItem) {
            return
        }

        const state = this._store.getState()

        switch (selectedItem.type) {
            case "file":
                this._editorManager.activeEditor.openFile(selectedItem.filePath)
                windowManager.focusSplit(this._editorManager.activeEditor as any)
                return
            case "folder":
                const isDirectoryExpanded = ExplorerSelectors.isPathExpanded(
                    state,
                    selectedItem.folderPath,
                )
                this._store.dispatch({
                    type: isDirectoryExpanded ? "COLLAPSE_DIRECTORY" : "EXPAND_DIRECTORY",
                    directoryPath: selectedItem.folderPath,
                })
                return
            default:
                alert("Not implemented yet.") // tslint:disable-line
        }
    }

    private _getSelectedItem(id?: string): ExplorerSelectors.ExplorerNode {
        const state = this._store.getState()

        const nodes = ExplorerSelectors.mapStateToNodeList(state)

        const idToUse = id || this._selectedId

        const items = nodes.filter(item => item.id === idToUse)

        if (!items || !items.length) {
            return null
        }

        return items[0]
    }

    private _onDeleteItem(): void {
        const selectedItem = this._getSelectedItem()

        if (!selectedItem) {
            return
        }

        switch (selectedItem.type) {
            case "file":
                rm(selectedItem.filePath)
                break
            case "folder":
                rm("-rf", selectedItem.folderPath)
                break
            default:
                alert("Not implemented yet")
        }

        this._store.dispatch({
            type: "REFRESH",
        })
    }
}
