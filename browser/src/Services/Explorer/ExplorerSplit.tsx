/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"

import * as Oni from "oni-api"
import { Event } from "oni-types"

import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

// import { Colors } from "./../Colors"

import { createStore, IExplorerState } from "./ExplorerStore"
// import { Sidebar } from "./SidebarView"

import { FileIcon } from "./../FileIcon"

import * as ExplorerSelectors from "./ExplorerSelectors"
import { Explorer } from "./ExplorerView"

export interface IRecentFileViewProps {
    fileName: string
    isModified?: boolean
}

export class RecentFileView extends React.PureComponent<IRecentFileViewProps, {}> {
    public render(): JSX.Element {
        const containerStyle: React.CSSProperties = {
            padding: "4px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        }

        const fileIconStyle: React.CSSProperties = {
            flex: "0 0 auto",
            width: "20px",
        }

        const textStyle: React.CSSProperties = {
            flex: "1 1 auto",
        }

        const modifiedIconStyle: React.CSSProperties = {
            flex: "0 0 auto",
            width: "20px",
        }

        return <div style={containerStyle}>
                <div style={fileIconStyle}><FileIcon fileName={this.props.fileName} /></div>
                <div style={textStyle}>{this.props.fileName}</div>
                <div style={modifiedIconStyle}></div>
            </div>
    }
}

export class ExplorerSplit {

    private _onEnterEvent: Event<void> = new Event<void>()

    // private _activeBinding: IMenuBinding = null
    private _activeBinding: IMenuBinding = null
    private _store: Store<IExplorerState>

    constructor(
        private _workspace: Oni.Workspace,
    ) {
        this._store = createStore()

        this._workspace.onDirectoryChanged.subscribe((newDirectory) => {
            this._store.dispatch({
                type: "SET_ROOT_DIRECTORY",
                rootPath: newDirectory,
            })
        })
    }

    public enter(): void {
        this._onEnterEvent.dispatch()

        this._activeBinding = getInstance().bindToMenu()

        const state = this._store.getState()

        const flattenedState = ExplorerSelectors.mapStateToNodeList(state)

        const items = flattenedState.map((fs) => fs.id)

        this._activeBinding.setItems(items)

        this._activeBinding.onCursorMoved.subscribe((id: string) => {
            this._store.dispatch({
                type: "SET_SELECTED_ID",
                selectedId: id,
            })
        })
    }

    public leave(): void {
        if (this._activeBinding) {
            this._activeBinding.release()
            this._activeBinding = null
        }
    }

    public render(): JSX.Element {

        return <Provider store={this._store}>
                <Explorer onEnter={this._onEnterEvent} onKeyDown={(key: string) => this._onKeyDown(key)}/>
            </Provider>
    }

    private _onKeyDown(key: string): void {
        if (this._activeBinding) {
            this._activeBinding.input(key)
        }
    }
}
