import * as capitalize from "lodash/capitalize"
import * as React from "react"
import { Provider } from "react-redux"

import { store, SupportedProviders, VersionControlProvider, VersionControlView } from "./"
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
    ) {}
    public enter(): void {
        this._store.dispatch({ type: "ENTER" })
    }

    public leave(): void {
        this._store.dispatch({ type: "LEAVE" })
    }

    public getModifiedFiles = async () => {
        const { activeWorkspace } = this._workspace
        const status = await this._vcsProvider.getStatus(activeWorkspace)
        if (status) {
            this._store.dispatch({ type: "MODIFIED_FILES", payload: { files: status.files } })
        }
        return status
    }

    public stageFile = (file: string) => {
        const { activeWorkspace } = this._workspace
        this._vcsProvider.stageFile(file, activeWorkspace)
    }

    public render(): JSX.Element {
        return (
            <Provider store={this._store}>
                <VersionControlView getModifiedFiles={this.getModifiedFiles} />
            </Provider>
        )
    }
}
