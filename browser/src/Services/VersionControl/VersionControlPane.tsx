import * as capitalize from "lodash/capitalize"
import * as React from "react"
import { Provider } from "react-redux"

import { store, SupportedProviders, VersionControlProvider, VersionControlView } from "./"
import * as Log from "./../../Log"
import { IWorkspace } from "./../Workspace"

export default class VersionControlPane {
    private _store = store
    public get id(): string {
        return "oni.sidebar.vcs"
    }

    public get title(): string {
        return capitalize(this._name)
    }
    constructor(
        private _workspace: IWorkspace,
        private _vcsProvider: VersionControlProvider,
        private _name: SupportedProviders,
    ) {
        this._vcsProvider.onBranchChanged.subscribe(async () => {
            await this.getStatus()
        })

        this._vcsProvider.onStagedFilesChanged.subscribe(async () => {
            await this.getStatus()
        })

        this._vcsProvider.onPluginActivated.subscribe(() => {
            this._store.dispatch({ type: "ACTIVATE" })
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
        const { activeWorkspace } = this._workspace
        const status = await this._vcsProvider.getStatus(activeWorkspace)
        if (status) {
            this._store.dispatch({ type: "STATUS", payload: { status } })
        }
        return status
    }

    public stageFile = async (file: string) => {
        const { activeWorkspace } = this._workspace
        await this._vcsProvider.stageFile(file, activeWorkspace)
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
