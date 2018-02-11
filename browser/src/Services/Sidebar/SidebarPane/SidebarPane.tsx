import * as React from "react"
import { Provider } from "react-redux"
import { Store } from "redux"

import { Event } from "oni-types"

import { KeyboardInputView } from "./../../../Input/KeyboardInput"
import * as Log from "./../../../Log"
import { getInstance, IMenuBinding } from "./../../../neovim/SharedNeovimInstance"
import { createStore } from "./../../../Redux"

import * as SidebarPaneStore from "./SidebarPaneStore"
import { SidebarPaneContainer } from "./SidebarPaneView"

import * as flatMap from "lodash/flatMap"

export class SidebarPane {
    private _store: Store<SidebarPaneStore.ISidebarPaneState>
    private _menuBinding: IMenuBinding
    private _onEnterEvent: Event<void> = new Event<void>()

    public get id(): string {
        return this._id
    }

    public get title(): string {
        return this._title
    }

    constructor(private _id: string, private _title: string) {
        this._store = createStore(
            "SidebarPane." + this._id,
            SidebarPaneStore.reducer,
            SidebarPaneStore.DefaultSidebarPaneState,
        )
    }

    public async enter(): Promise<void> {
        this._menuBinding = getInstance().bindToMenu()

        const widgets = this._store.getState().widgets
        const ids = flatMap(widgets, w => w.ids)

        await this._menuBinding.setItems(ids)

        this._menuBinding.onCursorMoved.subscribe((id: string) => {
            this._store.dispatch({
                type: "SET_SELECTED_ID",
                selectedId: id,
            })
        })

        this._onEnterEvent.dispatch()
        Log.info("[SidebarPane]::enter")
    }

    public leave(): void {
        Log.info("[SidebarPane]::leave")

        if (this._menuBinding) {
            this._menuBinding.release()
            this._menuBinding = null
        }
    }

    public set(widgets: SidebarPaneStore.ISidebarWidget | SidebarPaneStore.ISidebarWidget[]): void {
        if (!Array.isArray(widgets)) {
            widgets = [widgets]
        }

        this._store.dispatch({
            type: "SET_WIDGETS",
            widgets,
        })
    }

    public render(): JSX.Element {
        return (
            <Provider store={this._store}>
                <div>
                    <SidebarPaneContainer />
                    <div className="input">
                        <KeyboardInputView
                            top={0}
                            left={0}
                            height={12}
                            onActivate={this._onEnterEvent}
                            onKeyDown={key => this._onKeyDown(key)}
                            foregroundColor={"white"}
                            fontFamily={"Segoe UI"}
                            fontSize={"12px"}
                            fontCharacterWidthInPixels={12}
                        />
                    </div>
                </div>
            </Provider>
        )
    }

    private _onKeyDown(key: string) {
        if (this._menuBinding) {
            this._menuBinding.input(key)
        }
    }
}
