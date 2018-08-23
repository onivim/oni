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

import * as Log from "oni-core-logging"
import { Event } from "oni-types"

import { KeyboardInputView } from "./../../Input/KeyboardInput"
import { getInstance, IMenuBinding } from "./../../neovim/SharedNeovimInstance"

import { CallbackCommand, commandManager } from "./../../Services/CommandManager"

export interface IVimNavigatorProps {
    // activateOnMount: boolean
    ids: string[]

    active: boolean

    // onEnter: IEvent<void>
    // onLeave: IEvent<void>

    onSelectionChanged?: (selectedId: string) => void
    onSelected?: (selectedId: string) => void

    render: (selectedId: string, updateSelection: (id: string) => void) => JSX.Element

    style?: React.CSSProperties
    idToSelect?: string
}

export interface IVimNavigatorState {
    selectedId: string
    lastSelectedIndex: number
}

export class VimNavigator extends React.PureComponent<IVimNavigatorProps, IVimNavigatorState> {
    private _activeBinding: IMenuBinding = null
    private _activateEvent = new Event<void>()

    public static defaultProps: Partial<IVimNavigatorProps> = {
        ids: [],
    }

    public constructor(props: IVimNavigatorProps) {
        super(props)

        const selectedId = props.ids[0] || null
        const lastSelectedIndex = props.ids.indexOf(selectedId) || 0
        this.state = {
            selectedId,
            lastSelectedIndex,
        }
    }

    public componentDidMount(): void {
        this._updateBasedOnProps(this.props)
    }

    public componentDidUpdate(prevProps: IVimNavigatorProps, prevState: IVimNavigatorState): void {
        this._updateBasedOnProps(this.props)
    }

    public componentWillUnmount(): void {
        this._releaseBinding()
    }

    public updateSelection = (id: string) => {
        this.setState({ selectedId: id })
    }

    public render() {
        const inputElement = (
            <div className="input">
                <KeyboardInputView
                    top={0}
                    left={0}
                    height={12}
                    onActivate={this._activateEvent}
                    onKeyDown={key => this._onKeyDown(key)}
                    foregroundColor="white"
                    fontFamily="Segoe UI"
                    fontSize="12px"
                    fontCharacterWidthInPixels={12}
                />
            </div>
        )

        return (
            <div style={this.props.style}>
                <div className="items">
                    {this.props.render(this.state.selectedId, this.updateSelection)}
                </div>
                {this.props.active ? inputElement : null}
            </div>
        )
    }

    private _onKeyDown(key: string): void {
        if (this._activeBinding) {
            this._activeBinding.input(key)
        }
    }

    private _releaseBinding(): void {
        if (this._activeBinding) {
            this._activeBinding.release()
            this._activeBinding = null
        }
    }

    private _select(): void {
        if (this.state.selectedId && this.props.active && this.props.onSelected) {
            this.props.onSelected(this.state.selectedId)
        }
    }

    private async _updateBasedOnProps(props: IVimNavigatorProps) {
        if (props.active && !this._activeBinding) {
            Log.info("[VimNavigator::activating]")
            this._releaseBinding()
            this._activeBinding = getInstance().bindToMenu()

            commandManager.registerCommand(
                new CallbackCommand(
                    "select",
                    null,
                    null,
                    () => this._select(),
                    () => this.props.active,
                ),
            )

            this._activeBinding.onCursorMoved.subscribe(newValue => {
                Log.info("[VimNavigator::onCursorMoved] - " + newValue)
                this._maybeUpdateSelection(newValue)
            })

            await this._activeBinding.setItems(this.props.ids, this.state.selectedId)
            this._activateEvent.dispatch()
        } else if (props.active && this._activeBinding) {
            await this._activeBinding.setItems(this.props.ids, this.state.selectedId)
        } else if (!props.active && this._activeBinding) {
            this._releaseBinding()
        }

        const { lastSelectedIndex, selectedId } = this.state
        if (props.idToSelect) {
            this._maybeUpdateSelection(props.idToSelect)
        } else if (!selectedId) {
            const newIndex = lastSelectedIndex - 1 || 0
            if (!selectedId) {
                this.setState({
                    lastSelectedIndex: newIndex,
                    selectedId: this.props.ids[newIndex],
                })
            }
        }
    }

    private _maybeUpdateSelection(id: string) {
        if (id !== this.state.selectedId) {
            this.setState({
                selectedId: id,
                lastSelectedIndex: this.props.ids.indexOf(id),
            })

            if (this.props.onSelectionChanged) {
                this.props.onSelectionChanged(id)
            }
        }
    }
}
