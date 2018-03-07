/**
 * ExplorerSplit.tsx
 *
 */

import { capitalize } from "lodash"
import * as path from "path"
import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"

import { Event } from "oni-types"

// import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

import { CallbackCommand, CommandManager } from "./../../Services/CommandManager"
import { EditorManager } from "./../../Services/EditorManager"
// import { Configuration } from "./../../Services/Configuration"
import { getInstance as NotificationsInstance } from "./../../Services/Notifications"
import { windowManager } from "./../../Services/WindowManager"
import { IWorkspace } from "./../../Services/Workspace"

import { createStore, IExplorerState } from "./ExplorerStore"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { Explorer } from "./ExplorerView"

import { mv, rm } from "shelljs"

type Node = ExplorerSelectors.ExplorerNode
type File = ExplorerSelectors.IFileNode

export class ExplorerSplit {
    private _onEnterEvent: Event<void> = new Event<void>()
    private _selectedId: string = null
    private _notifications = NotificationsInstance()

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

    public sendExplorerNotification({ title, details }: { title: string; details: string }) {
        const notification = this._notifications.createItem()
        notification.setContents(title, details)
        notification.setLevel("success")
        notification.setExpiration(8000)
        notification.show()
    }

    public moveFileOrFolder = (source: Node, dest: Node): void => {
        if (!source || !dest) {
            return
        }

        let folderPath
        let sourcePath

        if (source.type === "folder" && dest.type === "folder") {
            return this.moveFolder(source, dest)
        }

        if (dest.type === "file") {
            const parent = this.findParentDir(dest.id)
            folderPath = parent
        } else if (dest.type === "container") {
            folderPath = dest.name
        } else {
            folderPath = dest.folderPath
        }

        if (folderPath && source.type === "file" && source.filePath) {
            sourcePath = source.filePath
        } else if (source.type === "folder" && folderPath) {
            sourcePath = source.folderPath
        }

        mv(sourcePath, folderPath)
        this._store.dispatch({ type: "REFRESH" })
        if (dest.type === "folder") {
            this._store.dispatch({ type: "EXPAND_DIRECTORY", directoryPath: dest.folderPath })
        }
        this.sendExplorerNotification({
            title: `${capitalize(source.type)} Moved`,
            details: `Successfully moved ${source.name} to ${folderPath}`,
        })
    }

    public moveFolder = (
        source: ExplorerSelectors.IFolderNode,
        destination: ExplorerSelectors.IFolderNode,
    ) => {
        if (source.folderPath === destination.folderPath) {
            return
        }
        mv(source.folderPath, destination.folderPath)
        this._store.dispatch({ type: "REFRESH" })
        this._store.dispatch({ type: "EXPAND_DIRECTORY", directoryPath: destination.folderPath })
        this.sendExplorerNotification({
            title: `${capitalize(source.type)} Moved`,
            details: `Successfully moved ${source.name} to ${destination.folderPath}`,
        })
    }

    public findParentDir = (fileId: string): string => {
        const { filePath } = this._getSelectedItem(fileId) as File
        const folder = path.dirname(filePath)
        return folder
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
