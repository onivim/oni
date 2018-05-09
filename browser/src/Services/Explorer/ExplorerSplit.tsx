/**
 * ExplorerSplit.tsx
 *
 */

import * as path from "path"
import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"
import { FileSystemWatcher } from "./../../Services/FileSystemWatcher"

import { Event } from "oni-types"

import { CallbackCommand, CommandManager } from "./../../Services/CommandManager"
import { Configuration } from "./../../Services/Configuration"
import { EditorManager } from "./../../Services/EditorManager"
import { getInstance as NotificationsInstance } from "./../../Services/Notifications"
import { windowManager } from "./../../Services/WindowManager"
import { IWorkspace } from "./../../Services/Workspace"

import { createStore, getPathForNode, IExplorerState } from "./ExplorerStore"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { Explorer } from "./ExplorerView"

type Node = ExplorerSelectors.ExplorerNode

export class ExplorerSplit {
    private _onEnterEvent: Event<void> = new Event<void>()
    private _selectedId: string = null
    private _store: Store<IExplorerState>
    private _watcher: FileSystemWatcher = null

    public get id(): string {
        return "oni.sidebar.explorer"
    }

    public get title(): string {
        return "Explorer"
    }

    constructor(
        private _configuration: Configuration,
        private _workspace: IWorkspace,
        private _commandManager: CommandManager,
        private _editorManager: EditorManager,
    ) {
        this._store = createStore({ notifications: NotificationsInstance() })

        this._initializeFileSystemWatcher()

        this._workspace.onDirectoryChanged.subscribe(newDirectory => {
            this._store.dispatch({
                type: "SET_ROOT_DIRECTORY",
                rootPath: newDirectory,
            })

            if (this._watcher) {
                this._watcher.unwatch(this._workspace.activeWorkspace)
                this._watcher.watch(newDirectory)
            }
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

    public moveFileOrFolder = (source: Node, dest: Node): void => {
        this._store.dispatch({ type: "PASTE", pasted: [source], target: dest })
    }

    public render(): JSX.Element {
        return (
            <Provider store={this._store}>
                <Explorer
                    onCancelCreate={this._cancelCreation}
                    onCompleteCreate={this._completeCreation}
                    onCompleteRename={this._completeRename}
                    onCancelRename={this._cancelRename}
                    onClick={id => this._onOpenItem(id)}
                    moveFileOrFolder={this.moveFileOrFolder}
                    onSelectionChanged={id => this._onSelectionChanged(id)}
                    fontSize={this._configuration.getValue("ui.fontSize")}
                />
            </Provider>
        )
    }

    private _initializeFileSystemWatcher(): void {
        if (this._configuration.getValue("explorer.autoRefresh")) {
            this._watcher = new FileSystemWatcher({
                target: this._workspace.activeWorkspace,
                options: { ignoreInitial: true, ignored: "**/node_modules" },
            })

            const events = ["onChange", "onAdd", "onAddDir", "onMove", "onDelete", "onDeleteDir"]
            events.forEach(event => this._watcher[event].subscribe(() => this._refresh()))
        }
    }

    private _inputInProgress = () => {
        const { register: { rename, create } } = this._store.getState()
        return rename.active || create.active
    }

    private _refresh(): void {
        this._store.dispatch({ type: "REFRESH" })
    }

    private _initialiseExplorerCommands(): void {
        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.delete.persist",
                null,
                null,
                () => !this._inputInProgress() && this._onDeleteItem({ persist: true }),
            ),
        )
        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.delete",
                null,
                null,
                () => !this._inputInProgress() && this._onDeleteItem({ persist: false }),
            ),
        )
        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.yank",
                "Yank Selected Item",
                "Select a file to move",
                () => !this._inputInProgress() && this._onYankItem(),
            ),
        )

        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.undo",
                "Undo last explorer action",
                null,
                () => !this._inputInProgress() && this._onUndoItem(),
            ),
        )

        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.paste",
                "Move/Paste Selected Item",
                "Paste the last yanked item",
                () => !this._inputInProgress() && this._onPasteItem(),
            ),
        )

        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.refresh",
                "Explorer: Refresh the tree",
                "Updates the explorer with the latest state on the file system",
                () => !this._inputInProgress() && this._refresh(),
            ),
        )

        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.create.file",
                "Create A New File in the Explorer",
                null,
                () => !this._inputInProgress() && this._onCreateNode({ type: "file" }),
            ),
        )

        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.create.folder",
                "Create A New File in the Explorer",
                null,
                () => !this._inputInProgress() && this._onCreateNode({ type: "folder" }),
            ),
        )

        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.expand.directory",
                "Expand a selected directory",
                null,
                () => !this._inputInProgress() && this._toggleDirectory("expand"),
            ),
        )

        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.collapse.directory",
                "Collapse selected directory",
                null,
                () => !this._inputInProgress() && this._toggleDirectory("collapse"),
            ),
        )

        this._commandManager.registerCommand(
            new CallbackCommand(
                "explorer.rename",
                "Rename the selected file/folder",
                null,
                () => !this._inputInProgress() && this._renameItem(),
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

    private _getSelectedItem(id: string = this._selectedId): ExplorerSelectors.ExplorerNode {
        const state = this._store.getState()

        const nodes = ExplorerSelectors.mapStateToNodeList(state)

        const items = nodes.filter(item => item.id === id)

        if (!items || !items.length) {
            return null
        }

        return items[0]
    }

    private _getSelectedItemParent(filePath: string): ExplorerSelectors.ExplorerNode {
        const state = this._store.getState()
        const nodes = ExplorerSelectors.mapStateToNodeList(state)
        const parentDir = path.dirname(filePath)

        const [parentNode] = nodes.filter(
            item =>
                (item.type === "folder" && item.folderPath === parentDir) ||
                (item.type === "container" && item.name === parentDir),
        )

        return parentNode
    }

    private _renameItem = () => {
        const selected = this._getSelectedItem()
        if (!selected) {
            return
        }
        this._store.dispatch({ type: "RENAME_START", target: selected })
    }

    private _completeRename = (newName: string) => {
        const target = this._getSelectedItem()

        if (!target) {
            return
        }
        this._store.dispatch({ type: "RENAME_COMMIT", newName, target })
    }

    private _cancelRename = () => {
        this._store.dispatch({ type: "RENAME_CANCEL" })
    }

    private _onCreateNode = ({ type }: { type: "file" | "folder" }) => {
        this._store.dispatch({ type: "CREATE_NODE_START", nodeType: type })
    }

    private _completeCreation = (newName: string) => {
        const target = this._getSelectedItem()

        if (!target) {
            return
        }

        const nodePath = getPathForNode(target)
        const dirname = target.type === "file" ? path.dirname(nodePath) : nodePath
        this._store.dispatch({ type: "CREATE_NODE_COMMIT", name: path.join(dirname, newName) })
    }

    private _cancelCreation = () => {
        this._store.dispatch({ type: "CREATE_NODE_CANCEL" })
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
        } else {
            this._store.dispatch({ type: "CLEAR_REGISTER", ids: [selectedItem.id] })
        }
    }

    private _onPasteItem(): void {
        const pasteTarget = this._getSelectedItem()
        if (!pasteTarget) {
            return
        }

        const { register: { yank } } = this._store.getState()

        if (yank.length && pasteTarget) {
            const sources = yank.map(
                node => (node.type === "file" ? this._getSelectedItemParent(node.filePath) : node),
            )
            this._store.dispatch({
                type: "PASTE",
                target: pasteTarget,
                pasted: yank,
                sources,
            })
        }
    }

    private _onDeleteItem({ persist }: { persist: boolean }): void {
        const selectedItem = this._getSelectedItem()

        if (!selectedItem) {
            return
        }
        this._store.dispatch({ type: "DELETE", target: selectedItem, persist })
    }
}
