/**
 * NeovimInput.tsx
 *
 * Layer responsible for handling Neovim input interactiosn
 */

import * as React from "react"

import { NeovimInstance } from "./../neovim"
import { NeovimScreen } from "./../Screen"

import * as UI from "./../UI/index"

import { keyEventToVimKey } from "./../Input/Keyboard"
import { Mouse } from "./../Input/Mouse"
// import { keyEventToVim } from "./../Input/Keyboard"

export interface INeovimInputProps {
    neovimInstance: NeovimInstance
    screen: NeovimScreen
    onKeyDown?: (key: string) => void
}

export class NeovimInput extends React.PureComponent<INeovimInputProps, void> {
    private _mouseElement: HTMLDivElement
    private _mouse: Mouse

    public componentDidMount(): void {
        if (this._mouseElement) {
            this._mouse = new Mouse(this._mouseElement, this.props.screen)

            this._mouse.on("mouse", (mouseInput: string) => {
                UI.Actions.hideCompletions()
                this.props.neovimInstance.input(mouseInput)
            })
        }
    }

    public render(): JSX.Element {
        return <div ref={(elem) => this._mouseElement = elem} className="stack enable-mouse">
            <KeyboardInput onKeyDown={this.props.onKeyDown} />
        </div>
    }
}

export interface IKeyboardInputViewProps {
    top: number
    left: number
    height: number
    onKeyDown?: (key: string) => void
    foregroundColor: string
    imeEnabled: boolean
}

export interface IKeyboardInputViewState {
    /**
     * Tracks if composition is occurring (ie, an IME is active)
     */
    isComposing: boolean
}

import { focusManager } from "./../Services/FocusManager"

/**
 * KeyboardInput
 *
 * Helper for managing state and sanitizing input from dead keys, IME, etc
 */
export class KeyboardInputView extends React.PureComponent<IKeyboardInputViewProps, IKeyboardInputViewState> {
    private _keyboardElement: HTMLInputElement

    constructor() {
        super()

        this.state = {
            isComposing: false,
        }
    }

    public focus() {
        this._keyboardElement.focus()
    }

    public componentDidMount(): void {
        if (this._keyboardElement) {

            this._keyboardElement.addEventListener("compositionstart", (evt) => {
                this.setState({
                    isComposing: true,
                })
            })

            this._keyboardElement.addEventListener("compositionend", (evt) => {
                this._commit(this._keyboardElement.value)
            })

            this._keyboardElement.addEventListener("input", (evt) => {
                const valueLength = this._keyboardElement.value.length

                if (!this.state.isComposing && valueLength > 0) {
                    this._commit(this._keyboardElement.value)
                }
            })

            focusManager.pushFocus(this._keyboardElement)
        }
    }

    private _onKeyDown(evt: React.KeyboardEvent<HTMLInputElement>) {
        // 'Process' means hand-off to the IME -
        // so the composition events should handle this
        if (evt.key === "Process" || evt.key === "Dead") {
            return
        }

        // TODO: Consolidate this logic
        if (!this.props.imeEnabled) {
            const key = keyEventToVimKey(evt.nativeEvent)
            this._commit(key)
            evt.preventDefault()
            return
        }

        if (!this.state.isComposing) {
            const key = keyEventToVimKey(evt.nativeEvent)

            if (key.length > 1) {
                this._commit(key)
                evt.preventDefault()
            }
        }
    }

    public render(): JSX.Element {
        const opacity = this.state.isComposing ? 0.8 : 0

        const style: React.CSSProperties = {
            position: "absolute",
            top: this.props.top.toString() + "px",
            left: this.props.left.toString() + "px",
            height: this.props.height.toString() + "px",
            width: "100%",
            backgroundColor: "transparent",
            padding: "0px",
            color: this.props.foregroundColor,
            border: "0px",
            outline: "none",
            font: "inherit",
            pointerEvents: "none",
            opacity,
        }

        // IME is disabled for 'password' type fields
        const inputType = this.props.imeEnabled ? "text" : "password"

        return <input
            style={style}
            ref={(elem) => this._keyboardElement = elem}
            type={inputType}
            onKeyDown={(evt) => this._onKeyDown(evt)}/>
    }

    private _commit(val: string): void {
        this.setState({
            isComposing: false,
        })

        this._keyboardElement.value = ""
        this.props.onKeyDown(val)
    }
}

import { connect } from "react-redux"
import { IState } from "./../UI/State"

const mapStateToProps = (state: IState, originalProps: Partial<IKeyboardInputViewProps>): IKeyboardInputViewProps => {
    return {
        ...originalProps,
        top: state.cursorPixelY,
        left: state.cursorPixelX,
        height: state.fontPixelHeight,
        foregroundColor: state.foregroundColor,
        imeEnabled: state.mode === "insert",
    }
}

const KeyboardInput = connect(mapStateToProps)(KeyboardInputView)
