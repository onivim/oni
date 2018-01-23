/*
 * VimNavigator.tsx
 *
 * Component that enables vim-style navigation for React components.
 * You give it a set of ids (or later, a grid), and it will let you
 * know what is selected.
 *
 * Some future plans:
 * - Support a grid
 * - Support multiselection
 */

import * as React from "react"

import { Event } from "oni-types"

import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"
import { KeyboardInputView } from "./../../Input/KeyboardInput"

import * as Log from "./../../Log"

export interface IVimNavigatorProps {
    // activateOnMount: boolean
    ids: string[]

    active: boolean

    // onEnter: IEvent<void>
    // onLeave: IEvent<void>

    onSelectionChanged?: (selectedId: string) => void

    render: (selectedId: string) => JSX.Element
}

export interface IVimNavigatorState {
    selectedId: string
}

export class VimNavigator extends React.PureComponent<IVimNavigatorProps, IVimNavigatorState> {
    private _activeBinding: IMenuBinding = null
    private _activateEvent = new Event<void>()

    constructor(props: IVimNavigatorProps) {
        super(props)

        this.state = {
            selectedId: null,
        }
    }

    public componentDidMount(): void {
        this._updateBasedOnProps(this.props)
    }

    public componentDidUpdate(prevProps: IVimNavigatorProps, prevState: IVimNavigatorState): void {
        this._updateBasedOnProps(this.props)
    }

    public _updateBasedOnProps(props: IVimNavigatorProps) {
        
        if (props.active && !this._activeBinding) {
            Log.info("[VimNavigator::activating]")
            this._releaseBinding()
            this._activeBinding = getInstance().bindToMenu()

            this._activeBinding.onCursorMoved.subscribe((newValue) => {
                Log.info("[VimNavigator::onCursorMoved] - " + newValue)
                this.setState({
                    selectedId: newValue,
                })

                if (this.props.onSelectionChanged) {
                    this.props.onSelectionChanged(newValue)
                }
            })

            this._activeBinding.setItems(this.props.ids, this.state.selectedId)
            this._activateEvent.dispatch()
        } else if(!props.active && this._activeBinding) {
            this._releaseBinding()
        }
    }

    public componentWillUnmount(): void {
        this._releaseBinding()
    }

    private _releaseBinding(): void {
        if (this._activeBinding) {
            this._activeBinding.release()
            this._activeBinding = null
        }
    }

    public render() {

        const inputElement = <div className="input">
                    <KeyboardInputView
                        top={0}
                        left={0}
                        height={12}
                        onActivate={this._activateEvent}
                        onKeyDown={(key) => this._onKeyDown(key)}
                        foregroundColor={"white"}
                        fontFamily={"Segoe UI"}
                        fontSize={"12px"}
                        fontCharacterWidthInPixels={12}
                        />
                </div>

        return <div>
                <div className="items">
                    {this.props.render(this.state.selectedId)}
                </div>
                { this.props.active ? inputElement : null}
            </div>
    }

    private _onKeyDown(key: string): void {
        if (this._activeBinding) {
            this._activeBinding.input(key)
        }
    }
}
