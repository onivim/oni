/**
 * NeovimInput.tsx
 *
 * Layer responsible for handling Neovim input interactiosn
 */

import * as React from "react"

import { IEvent } from "oni-types"

import { Mouse } from "./../../Input/Mouse"
import { NeovimInstance, NeovimScreen } from "./../../neovim"

import { TypingPredictionManager } from "./../../Services/TypingPredictionManager"

import { KeyboardInput } from "./../../Input/KeyboardInput"

export interface INeovimInputProps {
    neovimInstance: NeovimInstance
    screen: NeovimScreen
    onActivate: IEvent<void>
    onBounceStart: () => void
    onBounceEnd: () => void
    onImeStart: () => void
    onImeEnd: () => void
    onKeyDown?: (key: string) => void

    typingPrediction: TypingPredictionManager
}

export class NeovimInput extends React.PureComponent<INeovimInputProps, {}> {
    private _mouseElement: HTMLDivElement
    private _mouse: Mouse

    public componentDidMount(): void {
        if (this._mouseElement) {
            this._mouse = new Mouse(this._mouseElement, this.props.screen)

            this._mouse.on("mouse", (mouseInput: string) => {
                this.props.neovimInstance.input(mouseInput)
            })
        }
    }

    public render(): JSX.Element {
        return (
            <div ref={elem => (this._mouseElement = elem)} className="stack enable-mouse">
                <KeyboardInput
                    onActivate={this.props.onActivate}
                    typingPrediction={this.props.typingPrediction}
                    onBounceStart={this.props.onBounceStart}
                    onBounceEnd={this.props.onBounceEnd}
                    onImeStart={this.props.onImeStart}
                    onImeEnd={this.props.onImeEnd}
                    onKeyDown={this.props.onKeyDown}
                />
            </div>
        )
    }
}
