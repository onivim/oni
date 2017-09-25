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
import { Keyboard } from "./../Input/Keyboard"

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

/**
 * KeyboardInput
 *
 * Helper for managing state and sanitizing input from dead keys, IME, etc
 */
export class KeyboardInputView extends React.PureComponent<IKeyboardInputViewProps, void> {
    private _keyboardElement: HTMLInputElement
    private _keyboard: Keyboard

    public componentDidMount(): void {
        if (this._keyboardElement) {
            this._keyboard = new Keyboard(this._keyboardElement)

            this._keyboardElement.focus()
            this._keyboard.on("keydown", (key: string) => {
                if (this.props.onKeyDown) {
                    this.props.onKeyDown(key)
                }
            })
        }
    }

    public render(): JSX.Element {
        const style: React.CSSProperties = {
            position: "absolute",
            top: this.props.top.toString() + "px",
            left: this.props.left.toString() + "px",
            height: this.props.height.toString() + "px",
            backgroundColor: "rgba(0, 0, 0, 0)",
            padding: "0px",
            color: this.props.foregroundColor,
            border: "0px",
            outline: "none",
            font: "inherit",
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
        backgroundColor: state.backgroundColor,
        foregroundColor: state.foregroundColor,
    }
}

const KeyboardInput = connect(mapStateToProps)(KeyboardInputView)

