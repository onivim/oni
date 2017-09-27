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
}

export interface IKeyboardInputViewState {
    /**
     * Tracks if composition is occurring (ie, an IME is active)
     */
    isComposing: boolean

    /**
     * Tracks where a 'dead key' was pressed
     */
    isDeadKey: boolean
}

/**
 * KeyboardInput
 *
 * Helper for managing state and sanitizing input from dead keys, IME, etc
 */
export class KeyboardInputView extends React.PureComponent<IKeyboardInputViewProps, IKeyboardInputViewState> {
    private _keyboardElement: HTMLInputElement
    // private _keyboard: Keyboard

    constructor() {
        super()

        this.state = {
            isComposing: false,
            isDeadKey: false,
        }
    }

    public focus() {
        this._keyboardElement.focus()
    }

    public componentDidMount(): void {
        if (this._keyboardElement) {

            this._keyboardElement.addEventListener("blur", (evt) => {
                window.setTimeout(() => this._keyboardElement.focus(), 0)
            })

            this._keyboardElement.addEventListener("compositionstart", (evt) => {
                this.setState({
                    isComposing: true
                })
            })

            this._keyboardElement.addEventListener("compositionend", (evt) => {
                this._commit(this._keyboardElement.value)
            })

            this._keyboardElement.addEventListener("input", (evt) => {

                const valueLength = this._keyboardElement.value.length

                if (this.state.isDeadKey) {
                    const value = this._keyboardElement.value
                    this._commit(value)
                } else if (valueLength > 0 && !this.state.isComposing) {
                    this._keyboardElement.value = ""
                }
            })

            this._keyboardElement.addEventListener("keydown", (evt) => {

                // 'Process' means hand-off to the IME - 
                // so the composition events should handle this
                if (evt.key === "Process") {
                    return
                }

                if (evt.key === "Dead") {
                    this.setState({
                        isDeadKey: true
                    })
                    return
                }

                if (!this.state.isComposing && !this.state.isDeadKey) {
                    const key = keyEventToVimKey(evt)
                    this._commit(key)
                }
            })

            this._keyboardElement.focus()

        }
    }

    private _commit(val: string): void {
        this.setState({
            isComposing: false,
            isDeadKey: false,
        })

        this._keyboardElement.value = ""
        this.props.onKeyDown(val)
    }

    public render(): JSX.Element {

        const opacity = this.state.isComposing || this.state.isDeadKey ? 0.8 : 0

        const style: React.CSSProperties = {
            position: "absolute",
            top: this.props.top.toString() + "px",
            left: this.props.left.toString() + "px",
            height: this.props.height.toString() + "px",
            width: "100px",
            backgroundColor: "transparent",
            padding: "0px",
            color: this.props.foregroundColor,
            border: "1px solid " + this.props.foregroundColor,
            marginTop: "-1px",
            outline: "none",
            font: "inherit",
            opacity,
        }

        return <input
            style={style}
            ref={(elem) => this._keyboardElement = elem}
            type="text" />
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
    }
}

const KeyboardInput = connect(mapStateToProps)(KeyboardInputView)

