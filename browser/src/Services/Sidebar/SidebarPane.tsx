import * as React from "react"
import { Store } from "redux"
import { connect, Provider } from "react-redux"

import { Event } from "oni-types"

import { KeyboardInputView } from "./../../Input/KeyboardInput"
import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"
import { createStore } from "./../../Redux"

import * as flatMap from "lodash/flatMap"

export interface IWidgetRenderContext {
    selectedId: string
}

export interface ISidebarWidget {
    ids: string[]

    render(context: IWidgetRenderContext): JSX.Element
}

export interface ISidebarPaneState {
    selectedId: string
    widgets: ISidebarWidget[]
}

export type SidebarPaneActions = {
    type: "SET_WIDGETS",
    widgets: ISidebarWidget[]
} | {
    type: "SET_SELECTED_ID",
    selectedId: string,
}

export const DefaultSidebarPaneState: ISidebarPaneState = {
    widgets: [],
    selectedId: null,
}

export const reducer = (
    state: ISidebarPaneState = DefaultSidebarPaneState,
    action: SidebarPaneActions
) => {
    switch (action.type) {
        case "SET_WIDGETS":
            return {
                ...state,
                widgets: action.widgets
            }
        case "SET_SELECTED_ID":
            return {
                ...state,
                selectedId: action.selectedId,
            }
        default:
            return state
    }
}


export class SidebarPane {

    private _store: Store<ISidebarPaneState> 
    private _menuBinding: IMenuBinding
    private _onEnterEvent: Event<void> = new Event<void>()

    public get id(): string {
        return this._id
    }

    public get title(): string {
        return this._title
    }

    constructor(
        private _id: string,
        private _title: string,
    ) {
        this._store = createStore("SidebarPane." + this._id, reducer, DefaultSidebarPaneState)
    }

    public enter(): void {

        this._menuBinding = getInstance().bindToMenu()

        const widgets = this._store.getState().widgets
        const ids = flatMap(widgets, (w) => w.ids)

        this._menuBinding.setItems(ids)

        this._menuBinding.onCursorMoved.subscribe((id: string) => {
            console.log(id)

            this._store.dispatch({
                type: "SET_SELECTED_ID",
                selectedId: id,
            })
        })

        this._onEnterEvent.dispatch()
        console.log("ENTERED")

    }

    public leave(): void {
        console.log("LEAVE")

        if (this._menuBinding) {
            this._menuBinding.release()
            this._menuBinding = null
        }
    }

    public set(widgets: ISidebarWidget | ISidebarWidget[]): void {
        if (!Array.isArray(widgets)) {
            widgets = [widgets]
        }

        this._store.dispatch({
            type: "SET_WIDGETS",
            widgets: widgets,
        })

    }

    private _onKeyDown(key: string) {
        if (this._menuBinding) {
            this._menuBinding.input(key)
        }
    }


    public render(): JSX.Element {
        return <Provider store={this._store}>
                <div>
                    <SidebarPaneContainer />
                    <div className="input">
                        <KeyboardInputView
                            top={0}
                            left={0}
                            height={12}
                            onActivate={this._onEnterEvent}
                            onKeyDown={(key) => this._onKeyDown(key)}
                            foregroundColor={"white"}
                            fontFamily={"Segoe UI"}
                            fontSize={"12px"}
                            fontCharacterWidthInPixels={12}

                            />
                    </div>
                </div>
            </Provider>
    }
}

export interface ISidebarPaneViewProps {
    selectedId: string
    widgets: ISidebarWidget[]
}

export class SidebarPaneView extends React.PureComponent<ISidebarPaneViewProps, {}> {
    public render(): JSX.Element[] {

        const context: IWidgetRenderContext = {
            selectedId: this.props.selectedId,
        }

        return this.props.widgets.map((w, i) => {
            return <div key={i}>
            {w.render(context)}
            </div>
        }
        )
    }
}

const mapStateToProps = (state: ISidebarPaneState): ISidebarPaneViewProps => {
    return state
}

const SidebarPaneContainer = connect(mapStateToProps)(SidebarPaneView)

/**
 * Widgets
 */

export class LabelWidget implements ISidebarWidget {
    public get ids(): string[] {
        return []
    }

    public render(context: IWidgetRenderContext): JSX.Element {
        return <div>test</div>
    }
}

export type ItemWidgetRenderFunction = (widgetRenderContext: IWidgetRenderContext) => JSX.Element

export class ItemWidget implements ISidebarWidget {

    public get ids(): string[] {
        return [this._id]
    }
        private _renderer: ItemWidgetRenderFunction

    constructor(
        private _id: string,
        // private _renderer: ItemWidgetRenderFunction = (context) => <div style={{fontWeight: context.selectedId === this._id ? "bold" : null}}>Test2</div>
    ) { 
           this._renderer = (context) => <div style={{fontWeight: context.selectedId === this._id ? "bold" : null}}>Test2</div> 
    }

    public render(widgetRenderContext: IWidgetRenderContext): JSX.Element {
        return this._renderer(widgetRenderContext)
    }
}

// export class ContainerWidget implements ISidebarWidget {
    
// }
