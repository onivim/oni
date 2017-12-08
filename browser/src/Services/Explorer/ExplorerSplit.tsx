/**
 * ExplorerSplit.tsx
 *
 */

import * as React from "react"
// import { Provider } from "react-redux"
// import { Store } from "redux"

// import { Event } from "oni-types"

// import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

// import { Colors } from "./../Colors"

// import { createStore, ISidebarState } from "./SidebarStore"
// import { Sidebar } from "./SidebarView"

export class ExplorerSplit {

    // private _onEnterEvent: Event<void> = new Event<void>()

    // private _activeBinding: IMenuBinding = null
    // private _store: Store<ISidebarState>

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

        const containerStyle = {
            width: "200px",
            color: "rgb(171, 179, 191)",
            backgroundColor: "rgb(40, 44, 52)",
            height: "100%"
        }

        const tabStyle = {
            height: "2.5em",
            lineHeight: "2.5em",
            textAlign: "center",
            fontSize: "13px",
            fontFamily: "Segoe UI",
        }

        const headerStyle = {
            // boxShadow: "inset 0px 1px 8px 1px rgba(0, 0, 0, 0.1), inset 0px -1px 8px 1px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#1e2127",
            // padding: "8px",
        }

        const iconStyle = {
            margin: "4px",
        }

        return <div style={containerStyle} className="enable-mouse">
                <div style={tabStyle}>Explorer</div>

                <div>
                    <div style={headerStyle}>
                        <i style={iconStyle} className="fa fa-caret-down" />
                        <span>Open Buffers</span>
                    </div>
                    <div>
                        <div>File1.ts</div>
                        <div>File2.ts</div>
                    </div>
                    <div style={headerStyle}>
                        <i style={iconStyle} className="fa fa-caret-right" />
                        <span>C:/oni</span>
                    </div>
                </div>
            </div>
        // return <Provider store={this._store}>
        //         <Sidebar onKeyDown={(key: string) => this._onKeyDown(key)} onEnter={this._onEnterEvent}/>
        //     </Provider>
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
