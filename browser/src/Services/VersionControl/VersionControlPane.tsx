import * as capitalize from "lodash/capitalize"
import * as Oni from "oni-api"
import * as Log from "oni-core-logging"
import * as React from "react"
import { Provider, Store } from "react-redux"

import { VersionControlProvider, VersionControlView } from "./"
import { IWorkspace } from "./../Workspace"
import { ISendVCSNotification } from "./VersionControlManager"
import { VersionControlState } from "./VersionControlStore"

export default class VersionControlPane {
    public get id(): string {
        return "oni.sidebar.vcs"
    }

    public get title(): string {
        return capitalize(this._vcsProvider.name)
    }

    constructor(
        private _editorManager: Oni.EditorManager,
        private _workspace: IWorkspace,
        private _vcsProvider: VersionControlProvider,
        private _sendNotification: ISendVCSNotification,
        private _store: Store<VersionControlState>,
    ) {
        this._editorManager.activeEditor.onBufferSaved.subscribe(async () => {
            await this.getStatus()
        })

        this._vcsProvider.onBranchChanged.subscribe(async () => {
            await this.getStatus()
        })

        this._vcsProvider.onStagedFilesChanged.subscribe(async () => {
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

    public enter(): void {
        this._store.dispatch({ type: "ENTER" })
        this._workspace.onDirectoryChanged.subscribe(async () => {
            await this.getStatus()
        })
    }

    public leave(): void {
        this._store.dispatch({ type: "LEAVE" })
    }

    public getStatus = async () => {
        const status = await this._vcsProvider.getStatus()
        if (status) {
            this._store.dispatch({ type: "STATUS", payload: { status } })
        }
        return status
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

    public handleSelection = async (file: string): Promise<void> => {
        const { status } = this._store.getState()
        switch (true) {
            case status.untracked.includes(file):
            case status.modified.includes(file):
                await this.stageFile(file)
                break
            case status.staged.includes(file):
            default:
                break
        }
    }

    public render(): JSX.Element {
        return (
            <Provider store={this._store}>
                <VersionControlView
                    setError={this.setError}
                    getStatus={this.getStatus}
                    handleSelection={this.handleSelection}
                />
            </Provider>
        )
    }
}
