/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"

// import { Event } from "oni-types"

// import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

// import { Colors } from "./../Colors"

import { createStore, IExplorerState } from "./ExplorerStore"
// import { Sidebar } from "./SidebarView"

import { FileIcon } from "./../FileIcon"

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
            flex: "1 1 auto"
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

    // private _onEnterEvent: Event<void> = new Event<void>()

    // private _activeBinding: IMenuBinding = null
    private _store: Store<IExplorerState>

    constructor () {
        this._store = createStore()

        this._store.dispatch({
            type: "SET_ROOT_DIRECTORY",
            rootPath: "C:/oni"
        })
    }

    // constructor(
    //     private _colors: Colors,
    // ) {
    //     this._store = createStore()

    //     this._colors.onColorsChanged.subscribe(() => {
    //         this._updateColors()
    //     })

    //     this._updateColors()
    // }

    public enter(): void {
        console.log("File explorer - hello")
        // this._onEnterEvent.dispatch()

        // const state = this._store.getState()
        // this._store.dispatch({
        //     type: "SET_FOCUSED_ID",
        //     focusedEntryId: state.activeEntryId,
        // })

        // this._activeBinding = getInstance().bindToMenu()
        // this._activeBinding.setItems(state.icons.map((i) => i.id), state.activeEntryId)

        // this._activeBinding.onCursorMoved.subscribe((id: string) => {
        //     this._store.dispatch({
        //         type: "SET_FOCUSED_ID",
        //         focusedEntryId: id,
        //     })
        // })
    }

    public leave(): void {
        console.log("File explorer - goodbye")
        // if (this._activeBinding) {
        //     this._activeBinding.release()
        //     this._activeBinding = null
        // }

        // this._store.dispatch({
        //     type: "SET_FOCUSED_ID",
        //     focusedEntryId: null,
        // })
    }

    public render(): JSX.Element {

        return <Provider store={this._store}>
                <Explorer />
            </Provider>
    }

    // private _updateColors(): void {
    //     this._store.dispatch({
    //         type: "SET_COLORS",
    //         backgroundColor: this._colors.getColor("sidebar.background"),
    //         foregroundColor: this._colors.getColor("sidebar.foreground"),
    //         borderColor : this._colors.getColor("sidebar.selection.border"),
    //         activeColor : this._colors.getColor("sidebar.active.background"),
    //     })
    // }

    // private _onKeyDown(key: string): void {
    //     if (this._activeBinding) {
    //         this._activeBinding.input(key)
    //     }
    // }
}
