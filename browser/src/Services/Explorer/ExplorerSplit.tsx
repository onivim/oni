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

import { mv } from "shelljs"

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
        this._initialiseExplorerCommands()
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

    private _initialiseExplorerCommands(): void {
        this._commandManager.registerCommand(
            new CallbackCommand("explorer.delete.persist", null, null, () =>
                this._onDeletePersistItem(),
            ),
        )
        this._commandManager.registerCommand(
            new CallbackCommand("explorer.delete", null, null, () => this._onDeleteItem()),
        )
        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.yank",
                "Yank Selected Item",
                "Select a file to move",
                () => this._onYankItem(),
            ),
        )

        this._commandManager.registerCommand(
            new CallbackCommand("explorer.undo", "Undo last explorer action", null, () =>
                this._onUndoItem(),
            ),
        )

        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.paste",
                "Move/Paste Selected Item",
                "Paste the last yanked item",
                () => this._onPasteItem(),
            ),
        )

        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.expand.directory",
                "Expand a selected directory",
                null,
                () => this._toggleDirectory("expand"),
            ),
        )

        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.collapse.directory",
                "Collapse selected directory",
                null,
                () => this._toggleDirectory("collapse"),
            ),
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

    // This is different from on openItem since it only activates if the target is a folder
    // also it means that each bound key only does one thing aka "h" collapses and "l"
    // expands they are not toggles
    private _toggleDirectory(action: "expand" | "collapse"): void {
        const selectedItem = this._getSelectedItem()
        if (!selectedItem || selectedItem.type !== "folder") {
            return
        }

        const type = action === "expand" ? "EXPAND_DIRECTORY" : "COLLAPSE_DIRECTORY"
        this._store.dispatch({ type, directoryPath: selectedItem.folderPath })
    }

    private _onUndoItem(): void {
        const { register: { undo } } = this._store.getState()
        if (undo.length) {
            this._store.dispatch({ type: "UNDO" })
            this._store.dispatch({ type: "REFRESH" })
        }
    }

    private _onYankItem(): void {
        const selectedItem = this._getSelectedItem()
        if (!selectedItem) {
            return
        }

        const { register: { yank } } = this._store.getState()
        const inYankRegister = yank.some(({ id }) => id === selectedItem.id)

        if (!inYankRegister) {
            this._store.dispatch({ type: "YANK", target: selectedItem })
            this._store.dispatch({ type: "REFRESH" })
        } else {
            this._store.dispatch({ type: "CLEAR_REGISTER", id: selectedItem.id })
        }
    }

    private _onPasteItem(): void {
        const pasteTarget = this._getSelectedItem()
        if (!pasteTarget) {
            return
        }

        const { register: { yank } } = this._store.getState()

        if (yank.length && pasteTarget) {
            this._store.dispatch({ type: "PASTE", target: pasteTarget, pasted: yank })
            yank.forEach(yankedItem => {
                this.moveFileOrFolder(yankedItem, pasteTarget)
                this._store.dispatch({ type: "CLEAR_REGISTER", id: yankedItem.id })
            })
        }
    }

    private _onDeletePersistItem(): void {
        const selectedItem = this._getSelectedItem()

        if (!selectedItem) {
            return
        }
        this._store.dispatch({ type: "DELETE", target: selectedItem, persist: true })
        this._sendDeletionNotification(selectedItem.name, selectedItem.type)
    }

    private _onDeleteItem(persist: boolean = true): void {
        const selectedItem = this._getSelectedItem()

        if (!selectedItem) {
            return
        }
        this._store.dispatch({ type: "DELETE", target: selectedItem, persist: false })
        this._sendDeletionNotification(selectedItem.name, selectedItem.type)
    }

    private _sendDeletionNotification(name: string, type: string): void {
        this.sendExplorerNotification({
            title: `${capitalize(type)} deleted`,
            details: `${name} was deleted successfully`,
        })
    }
}
