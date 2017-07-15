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

export interface INeovimInputProps {
    neovimInstance: NeovimInstance
    screen: NeovimScreen
}

export class NeovimInput extends React.PureComponent<INeovimInputProps, void> {
    private _element: HTMLDivElement
    private _mouse: Mouse

    public componentDidMount(): void {
        if (this._element) {
            this._mouse = new Mouse(this._element, this.props.screen)

            this._mouse.on("mouse", (mouseInput: string) => {
                UI.Actions.hideCompletions()
                this.props.neovimInstance.input(mouseInput)
            })
        }
    }

    public render(): JSX.Element {
        return <div ref={ (elem) => this._element = elem } className="stack enable-mouse"></div>
    }
}
