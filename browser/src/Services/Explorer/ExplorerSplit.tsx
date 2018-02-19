/**
 * ExplorerSplit.tsx
 *
 */

import * as path from "path"
import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"

import { Event } from "oni-types"

// import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

import * as Log from "./../../Log"
import { CallbackCommand, CommandManager } from "./../../Services/CommandManager"
// import { Configuration } from "./../../Services/Configuration"
import { EditorManager } from "./../../Services/EditorManager"
import { windowManager } from "./../../Services/WindowManager"
import { IWorkspace } from "./../../Services/Workspace"

import { createStore, IExplorerState } from "./ExplorerStore"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { Explorer } from "./ExplorerView"

import { mv, rm } from "shelljs"

type Node = ExplorerSelectors.ExplorerNode

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
            new CallbackCommand("explorer.delete", null, null, () => this._onDeleteItem()),
        )

        this._onEnterEvent.dispatch()
    }

    public leave(): void {
        this._store.dispatch({ type: "LEAVE" })
    }

    public moveFileOrFolder = (source: Node, dest: Node): void => {
        let folderPath
        let sourcePath

        if (source.type === "folder" && dest.type === "folder") {
            return this.moveFolder(source, dest)
        }

        if (dest.type === "file") {
            const parent = this.findParentDir(dest.id)
            if (!parent) {
                return
            }
            if (parent.type === "folder") {
                folderPath = parent.folderPath
            } else if (parent.type === "container") {
                folderPath = parent.name
            }
        } else if (dest.type === "container") {
            folderPath = dest.name
        } else {
            folderPath = dest.folderPath
        }

        if (folderPath && source && source.type === "file" && source.filePath) {
            sourcePath = source.filePath
        } else if (source && source.type === "folder" && folderPath) {
            sourcePath = source.folderPath
        }

        Log.info(`moving: ${sourcePath} to ${folderPath}`)
        mv(sourcePath, folderPath)
        this._store.dispatch({ type: "REFRESH" })
    }

    public moveFolder = (
        source: ExplorerSelectors.IFolderNode,
        destination: ExplorerSelectors.IFolderNode,
    ) => {
        Log.info(`moving folders: ${source.folderPath} to ${destination.folderPath}`)
        mv(source.folderPath, destination.folderPath)
        this._store.dispatch({ type: "REFRESH" })
    }

    public findParentDir = (fileId: string): ExplorerSelectors.ExplorerNode => {
        const file = this._getSelectedItem(fileId) as { filePath: string }
        const parts = file.filePath.split(path.sep)
        const folder = parts.slice(0, parts.length - 1).join(path.sep)
        const parent = this._getSelectedItemByName(folder)
        return parent
    }

    public render(): JSX.Element {
        return (
            <Provider store={this._store}>
                <Explorer
                    onSelectionChanged={id => this._onSelectionChanged(id)}
                    onClick={id => this._onOpenItem(id)}
                    moveFileOrFolder={this.moveFileOrFolder}
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
                // FIXME: the editor manager is not a windowSplit aka this
                // Should be being called with an ID not an active editor
                windowManager.focusSplit("oni.window.0")
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

    private _getSelectedItemByName = (name: string) => {
        const state = this._store.getState()

        const nodes = ExplorerSelectors.mapStateToNodeList(state)

        // FIXME: use find as it's tidier
        const [folder] = nodes
            .filter(
                item =>
                    item.type === "container"
                        ? item.name === name
                        : item.type === "folder" ? item.folderPath : null,
            )
            .filter(i => !!i)

        return folder
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
