import * as capitalize from "lodash/capitalize"
import * as Oni from "oni-api"
import * as Log from "oni-core-logging"
import * as path from "path"
import * as React from "react"
import { Provider, Store } from "react-redux"

import { SidebarManager } from "../Sidebar"
import { VersionControlProvider, VersionControlView } from "./"
import { ISendVCSNotification } from "./VersionControlManager"
import { ProviderActions, VersionControlState } from "./VersionControlStore"

export interface IDsMap {
    modified: "modified"
    staged: "staged"
    untracked: "untracked"
    commits: "commits"
    commitAll: "commit_all"
}

export default class VersionControlPane {
    public get id() {
        return "oni.sidebar.vcs"
    }

    public get title() {
        return capitalize(this._vcsProvider.name)
    }

    public readonly IDs: IDsMap = {
        modified: "modified",
        commits: "commits",
        untracked: "untracked",
        staged: "staged",
        commitAll: "commit_all",
    }

    constructor(
        private _oni: Oni.Plugin.Api,
        private _vcsProvider: VersionControlProvider,
        private _sendNotification: ISendVCSNotification,
        private _sidebarManager: SidebarManager,
        private _store: Store<VersionControlState>,
    ) {
        this._registerCommands()

        this._oni.workspace.onDirectoryChanged.subscribe(this._refresh)
        this._vcsProvider.onFileStatusChanged.subscribe(this._refresh)
        this._vcsProvider.onBranchChanged.subscribe(this._getStatusIfVisible)
        this._vcsProvider.onStagedFilesChanged.subscribe(this._getStatusIfVisible)
        this._oni.editors.activeEditor.onBufferSaved.subscribe(this._getStatusIfVisible)
        this._oni.editors.activeEditor.onBufferEnter.subscribe(this._getStatusIfVisible)

        this._vcsProvider.onPluginActivated.subscribe(async () => {
            this._store.dispatch({ type: "ACTIVATE" })
            await this._refresh()
        })

        this._vcsProvider.onPluginDeactivated.subscribe(() => {
            this._store.dispatch({ type: "DEACTIVATE" })
        })
    }

    public async enter() {
        this._store.dispatch({ type: "ENTER" })
        await this._refresh()
    }

    public leave() {
        this._store.dispatch({ type: "LEAVE" })
    }

    public getStatus = async () => {
        const status = await this._vcsProvider.getStatus()
        if (status) {
            this._store.dispatch({ type: "STATUS", payload: { status } })
        }
        return status
    }

    public commit = async (messages: string[], files?: string[]) => {
        let summary = null
        const { status } = this._store.getState()
        const filesToCommit = files || status.staged
        this._dispatchLoading(true)
        try {
            summary = await this._vcsProvider.commitFiles(messages, filesToCommit)
            this._store.dispatch({ type: "COMMIT_SUCCESS", payload: { commit: summary } })
        } catch (e) {
            this._sendNotification({
                detail: e.message,
                level: "warn",
                title: `Error Commiting ${files[0]}`,
            })
            this._store.dispatch({ type: "COMMIT_FAIL" })
        } finally {
            await this._refresh()
            this._dispatchLoading(false)
        }
    }

    public stageFile = async (file: string) => {
        try {
            await this._vcsProvider.stageFile(file)
        } catch (e) {
            this._sendNotification({
                detail: e.message,
                level: "warn",
                title: "Error Staging File",
                expiration: 8_000,
            })
        }
    }

    public getLogs = async () => {
        this._dispatchLoading(true)
        const logs = await this._vcsProvider.getLogs()
        if (logs) {
            this._store.dispatch({ type: "LOG", payload: { logs } })
            this._dispatchLoading(false)
            return logs
        }
        return null
    }

    public uncommitFile = async (sha: string) => {
        try {
            await this._vcsProvider.uncommit()
            await this._refresh()
        } catch (error) {
            this._sendNotification({
                title: "Unable to revert last commit",
                detail: error.message,
                level: "warn",
            })
        }
    }

    public unstageFile = async () => {
        const {
            selected,
            status: { staged },
        } = this._store.getState()

        if (!this._isReadonlyField(selected) && staged.includes(selected)) {
            await this._vcsProvider.unstage([selected])
        }
    }

    public setError = async (e: Error) => {
        Log.warn(`version control pane failed to render due to ${e.message}`)
        this._store.dispatch({ type: "ERROR" })
    }

    public updateSelection = (selected: string) => {
        this._store.dispatch({ type: "SELECT", payload: { selected } })
    }

    public handleSelection = async (selected: string) => {
        const { status, logs } = this._store.getState()
        switch (true) {
            case status.untracked.includes(selected):
            case status.modified.includes(selected):
                await this.stageFile(selected)
                break
            case logs && logs.latest && logs.latest.hash === selected:
                await this.uncommitFile(selected)
                break
            case status.staged.includes(selected):
                this._store.dispatch({ type: "COMMIT_START", payload: { files: [selected] } })
                break
            case selected === "commit_all" && !!status.staged.length:
                this._store.dispatch({ type: "COMMIT_START", payload: { files: status.staged } })
                break
            default:
                break
        }
    }

    public render() {
        return (
            <Provider store={this._store}>
                <VersionControlView
                    IDs={this.IDs}
                    commit={this.commit}
                    setError={this.setError}
                    getStatus={this.getStatus}
                    handleSelection={this.handleSelection}
                    updateSelection={this.updateSelection}
                />
            </Provider>
        )
    }

    private _refresh = async () => {
        await Promise.all([this.getStatus(), this.getLogs()])
    }

    private _getStatusIfVisible = async () => {
        if (this._isVisible()) {
            await this._refresh()
        }
    }

    private _dispatchLoading = (loading: boolean, type: ProviderActions = "commit") => {
        this._store.dispatch({ type: "LOADING", payload: { loading, type } })
    }

    private _isVisible = () =>
        this._sidebarManager.isVisible && this._sidebarManager.activeEntryId === this.id

    private _isReadonlyField = (field: string) => Object.values(this.IDs).includes(field)

    private _toggleHelp = () => {
        this._store.dispatch({ type: "TOGGLE_HELP" })
    }

    private _isCommiting = () => {
        const state = this._store.getState()
        return state.hasFocus && state.commit.active
    }

    private _hasFocus = () => {
        const state = this._store.getState()
        return state.hasFocus
    }

    private _getCurrentCommitMessage() {
        const state = this._store.getState()
        return state.commit.message
    }

    private _registerCommands() {
        this._oni.commands.registerCommand({
            command: "vcs.commitAll",
            detail: "Commit all staged files",
            name: "Version Control: Commit all",
            enabled: this._isCommiting,
            execute: async () => {
                const currentMessage = this._getCurrentCommitMessage()
                if (currentMessage.length) {
                    await this.commit(currentMessage)
                }
            },
        })

        this._oni.commands.registerCommand({
            command: "vcs.openFile",
            detail: null,
            name: null,
            enabled: () => !this._isCommiting(),
            execute: async () => {
                const { selected } = this._store.getState()
                if (!this._isReadonlyField(selected)) {
                    const filePath = path.join(this._oni.workspace.activeWorkspace, selected)
                    await this._oni.editors.openFile(filePath)
                }
            },
        })

        this._oni.commands.registerCommand({
            command: "vcs.refresh",
            detail: null,
            name: null,
            enabled: this._hasFocus,
            execute: this._refresh,
        })

        this._oni.commands.registerCommand({
            command: "vcs.unstage",
            detail: null,
            name: null,
            enabled: () => this._hasFocus() && !this._isCommiting(),
            execute: this.unstageFile,
        })

        this._oni.commands.registerCommand({
            command: "vcs.showHelp",
            detail: null,
            name: null,
            enabled: () => !this._isCommiting(),
            execute: this._toggleHelp,
        })
    }
}
