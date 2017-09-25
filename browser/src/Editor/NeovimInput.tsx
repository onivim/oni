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
            <KeyboardInputView onKeyDown={this.props.onKeyDown} top={100} left={100} />
        </div>
    }
}

export interface IKeyboardInputViewProps {
    top: number
    left: number
    onKeyDown?: (key: string) => void
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
        }
        return <input
            style={style}
            ref={(elem) => this._keyboardElement = elem}
            type="text" />
    }

}
