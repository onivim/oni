import * as capitalize from "lodash/capitalize"
import * as Oni from "oni-api"
import * as Log from "oni-core-logging"
import * as React from "react"
import { Provider, Store } from "react-redux"

import { VersionControlProvider, VersionControlView } from "./"
import { IWorkspace } from "./../Workspace"
import { ISendVCSNotification } from "./VersionControlManager"
import { VersionControlState } from "./VersionControlStore"
import { Commits } from "./VersionControlProvider"

export default class VersionControlPane {
    public get id() {
        return "oni.sidebar.vcs"
    }

    public get title() {
        return capitalize(this._vcsProvider.name)
    }

    constructor(
        private _editorManager: Oni.EditorManager,
        private _workspace: IWorkspace,
        private _vcsProvider: VersionControlProvider,
        private _sendNotification: ISendVCSNotification,
        private _commands: Oni.Commands.Api,
        private _store: Store<VersionControlState>,
    ) {
        this._registerCommands()

        this._editorManager.activeEditor.onBufferSaved.subscribe(async () => {
            await this.getStatus()
        })

        this._vcsProvider.onBranchChanged.subscribe(async () => {
            await this.getStatus()
        })

        this._vcsProvider.onStagedFilesChanged.subscribe(async () => {
            await this.getStatus()
        })

        this._vcsProvider.onFileStatusChanged.subscribe(async () => {
            await this.getStatus()
        })

        this._vcsProvider.onPluginActivated.subscribe(async () => {
            this._store.dispatch({ type: "ACTIVATE" })
            await this.getStatus()
        })

        this._vcsProvider.onPluginDeactivated.subscribe(() => {
            this._store.dispatch({ type: "DEACTIVATE" })
        })
    }

    public enter() {
        this._store.dispatch({ type: "ENTER" })
        this._workspace.onDirectoryChanged.subscribe(async () => {
            await this.getStatus()
        })
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

    public registerCommitSuccess = (summary: Commits) => {
        if (summary) {
            this._store.dispatch({ type: "COMMIT_SUCCESS", payload: { commit: summary } })
        }
    }

    public commitFile = async (messages: string[], files: string[]) => {
        const summary = await this._vcsProvider.commitFiles(messages, files)
        this.registerCommitSuccess(summary)
    }

    public commitFiles = async (messages: string[]) => {
        const {
            status: { staged },
        } = this._store.getState()

        const summary = await this._vcsProvider.commitFiles(messages, staged)
        this.registerCommitSuccess(summary)
    }

    public stageFile = async (file: string) => {
        const { activeWorkspace } = this._workspace
        try {
            await this._vcsProvider.stageFile(file, activeWorkspace)
        } catch (e) {
            this._sendNotification({
                detail: e.message,
                level: "warn",
                title: "Error Staging File",
            })
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
        const { status } = this._store.getState()
        const commitAll = selected === "commit_all" && !!status.staged.length
        switch (true) {
            case status.untracked.includes(selected):
            case status.modified.includes(selected):
                await this.stageFile(selected)
                break
            case status.staged.includes(selected):
            case commitAll:
                this._store.dispatch({ type: "COMMIT_START" })
                break
            default:
                break
        }
    }

    public render() {
        return (
            <Provider store={this._store}>
                <VersionControlView
                    setError={this.setError}
                    getStatus={this.getStatus}
                    commitOne={this.commitFile}
                    commitAll={this.commitFiles}
                    handleSelection={this.handleSelection}
                    updateSelection={this.updateSelection}
                />
            </Provider>
        )
    }

    private _isCommiting = () => {
        const state = this._store.getState()
        return state.hasFocus && state.commit.active
    }

    private _getCurrentCommitMessage() {
        const state = this._store.getState()
        return state.commit.message
    }

    private _registerCommands() {
        this._commands.registerCommand({
            command: "oni.vcs.commitAll",
            detail: "Commit all staged files",
            name: "Version Control: Commit all",
            enabled: () => this._isCommiting(),
            execute: async () => {
                const currentMessage = this._getCurrentCommitMessage()
                if (currentMessage.length) {
                    await this.commitFiles(currentMessage)
                }
            },
        })
    }
}
