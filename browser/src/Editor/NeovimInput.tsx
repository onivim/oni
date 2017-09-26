/**
 * NeovimInput.tsx
 *
 * Layer responsible for handling Neovim input interactiosn
 */

import * as React from "react"


import { NeovimInstance } from "./../neovim"
import { NeovimScreen } from "./../Screen"

import * as UI from "./../UI/index"

// import { Keyboard } from "./../Input/Keyboard"
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
    backgroundColor: string
    foregroundColor: string
}

export interface IKeyboardInputViewState {

    /**
     * Tracks the current text in the keyboard input.
     * For non-Intl keys, this should always be empty - but in cases
     * with IME or dead keys, this will show the current uncomitted text.
     */
    composingText: string

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
            composingText: "",
            isComposing: false,
            isDeadKey: false
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
                const result = this._keyboardElement.value
                this.props.onKeyDown(result)

                this.setState({
                    isComposing: false,
                    composingText: ""
                })
            })

            this._keyboardElement.addEventListener("keydown", (evt) => {

                // 'Process' means hand-off to the IME - 
                // so the composition events should handle this
                if (evt.key === "Process") {
                    return
                }

                if (evt.key === "Dead") {
                    this.setState({
                        isComposing: true
                    })

                    return
                }

                // if (!this.state.isComposing) {
                //     const key = keyEventToVim(evt)
                //     this.props.onKeyDown(key)

                //     this.setState({
                //         isComposing: false,
                //         composingText: "",
                //     })
                // } else {
                //     this.setState({
                //         composingText: this.state.composingText + evt.key
                //     })
                // }
            })

            this._keyboardElement.focus()

        }
    }

    public render(): JSX.Element {

        const opacity = this.state.isComposing ? 1.0 : 0.1

        const style: React.CSSProperties = {
            position: "absolute",
            top: this.props.top.toString() + "px",
            left: this.props.left.toString() + "px",
            height: this.props.height.toString() + "px",
            backgroundColor: "yellow",
            padding: "0px",
            color: this.props.foregroundColor,
            border: "0px",
            outline: "none",
            font: "inherit",
            opacity,
        }

        return <input
            style={style}
            ref={(elem) => this._keyboardElement = elem}
            // value={this.state.composingText}
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
        backgroundColor: state.backgroundColor,
        foregroundColor: state.foregroundColor,
    }
}

const KeyboardInput = connect(mapStateToProps)(KeyboardInputView)

