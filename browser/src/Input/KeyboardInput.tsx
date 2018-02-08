/**
 * KeyboardInput.tsx
 *
 * Specialized input control to handle IME & dead key cases
 *  - Allows enabling / disabling IME
 *  - Follows cursor
 *  - Invisible when not composing
 */

import * as React from "react"
import { connect } from "react-redux"

import { IDisposable, IEvent } from "oni-types"

import { IState } from "./../Editor/NeovimEditor/NeovimEditorStore"
import { getKeyEventToVimKey } from "./../Input/Keyboard"
import { focusManager } from "./../Services/FocusManager"
import { TypingPredictionManager } from "./../Services/TypingPredictionManager"

import { measureFont } from "./../Font"

interface IKeyboardInputViewProps extends IKeyboardInputProps {
    top: number
    left: number
    height: number
    foregroundColor: string
    fontFamily: string
    fontSize: string
    fontCharacterWidthInPixels: number
}

interface IKeyboardInputViewState {
    /**
     * Tracks if composition is occurring (ie, an IME is active)
     */
    isComposing: boolean

    /**
     * Tracks the width of the currently composing text.
     * This isn't the same as the input text string value .length(),
     * because usually for IMEs there are multi-byte characters.
     */
    compositionTextWidthInPixels: number
}

export interface IKeyboardInputProps {
    startActive?: boolean
    onActivate: IEvent<void>

    onKeyDown?: (key: string) => void
    onImeStart?: () => void
    onImeEnd?: () => void
    typingPrediction?: TypingPredictionManager

    // Optional methods for integrating animation,
    // ie: 'cursor bounce':
    onBounceStart?: () => void
    onBounceEnd?: () => void
}

/**
 * KeyboardInput
 *
 * Helper for managing state and sanitizing input from dead keys, IME, etc
 */
export class KeyboardInputView extends React.PureComponent<
    IKeyboardInputViewProps,
    IKeyboardInputViewState
> {
    private _keyboardElement: HTMLInputElement
    private _disposables: IDisposable[] = []

    constructor(props: IKeyboardInputViewProps) {
        super(props)

        this.state = {
            isComposing: false,
            compositionTextWidthInPixels: 0,
        }
    }

    public focus() {
        this._keyboardElement.focus()
    }

    public componentDidMount(): void {
        if (this.props.onActivate) {
            this._removeExistingDisposables()
            const d1 = this.props.onActivate.subscribe(() => {
                focusManager.setFocus(this._keyboardElement)
            })
            this._disposables.push(d1)
        }

        if (this.props.startActive && this._keyboardElement) {
            focusManager.setFocus(this._keyboardElement)
        }
    }

    public componentWillUnmount(): void {
        this._removeExistingDisposables()
    }

    public render(): JSX.Element {
        const opacity = this.state.isComposing ? 0.8 : 0

        const containerStyle: React.CSSProperties = {
            position: "absolute",
            top: this.props.top.toString() + "px",
            left: this.props.left.toString() + "px",
            height: this.props.height.toString() + "px",
            right: "0px",
            pointerEvents: "none",
            opacity,
            overflow: "hidden",
            transform: "translateZ(0px)", // See #1129 - needed to keep it from re-rendering
        }

        const inputStyle: React.CSSProperties = {
            position: "absolute",
            padding: "0px",
            width: "100%",
            left: "0px",
            right: "0px",
            color: "black",
            border: "0px",
            outline: "none",
            font: "inherit",
            backgroundColor: "transparent",
        }

        const backgroundStyle: React.CSSProperties = {
            position: "absolute",
            height: "100%",
            backgroundColor: "white",
            left: "0px",
            padding: "2px",
            marginTop: "-2px",
            marginLeft: "-2px",
            width: this.state.compositionTextWidthInPixels + "px",
        }

        return (
            <div style={containerStyle}>
                <div style={backgroundStyle} />
                <input
                    style={inputStyle}
                    ref={elem => (this._keyboardElement = elem)}
                    type={"text"}
                    onKeyDown={evt => this._onKeyDown(evt)}
                    onKeyUp={evt => this._onKeyUp(evt)}
                    onCompositionEnd={evt => this._onCompositionEnd(evt)}
                    onCompositionUpdate={evt => this._onCompositionUpdate(evt)}
                    onCompositionStart={evt => this._onCompositionStart(evt)}
                    onInput={evt => this._onInput(evt)}
                />
            </div>
        )
    }

    private _onKeyUp(evt: React.KeyboardEvent<HTMLInputElement>) {
        if (this.props.onBounceEnd) {
            this.props.onBounceEnd()
        }
    }

    private _onKeyDown(evt: React.KeyboardEvent<HTMLInputElement>) {
        // 'Process' means hand-off to the IME -
        // so the composition events should handle this
        if (evt.key === "Process" || evt.key === "Dead") {
            return
        }

        if (this.state.isComposing) {
            return
        }

        if (this.props.onBounceStart) {
            this.props.onBounceStart()
        }

        const key = getKeyEventToVimKey()(evt.nativeEvent)

        if (!key) {
            return
        }

        const isMetaCommand = key.length > 1

        // We'll let the `input` handler take care of it,
        // unless it is a keystroke containing meta characters
        if (isMetaCommand) {
            this._commit(key)
            evt.preventDefault()
            return
        } else {
            if (this.props.typingPrediction) {
                this.props.typingPrediction.addPrediction(key)
            }
        }
    }

    private _onCompositionStart(evt: React.CompositionEvent<HTMLInputElement>) {
        if (this.props.onImeStart) {
            this.props.onImeStart()
        }

        if (this.props.typingPrediction) {
            this.props.typingPrediction.clearAllPredictions()
        }

        this.setState({
            isComposing: true,
        })
    }

    private _onCompositionUpdate(evt: React.CompositionEvent<HTMLInputElement>) {
        if (this._keyboardElement) {
            const measurements = measureFont(this.props.fontSize, this.props.fontFamily, evt.data)

            // Add some padding for an extra character to the end of the input box
            const roomForNextCharacter = this.props.fontCharacterWidthInPixels
            const width = Math.ceil(measurements.width) + roomForNextCharacter

            this.setState({
                compositionTextWidthInPixels: width,
            })
        }
    }

    private _onCompositionEnd(evt: React.CompositionEvent<HTMLInputElement>) {
        if (this.props.onImeEnd) {
            this.props.onImeEnd()
        }

        if (this._keyboardElement) {
            this._commit(this._keyboardElement.value)
        }
    }

    private _onInput(evt: React.FormEvent<HTMLInputElement>) {
        const valueLength = this._keyboardElement.value.length

        if (!this.state.isComposing && valueLength > 0) {
            this._commit(this._keyboardElement.value)
        }
    }

    private _commit(val: string): void {
        this.setState({
            isComposing: false,
            compositionTextWidthInPixels: 0,
        })

        this._keyboardElement.value = ""
        this.props.onKeyDown(val)
    }

    private _removeExistingDisposables(): void {
        this._disposables.forEach(d => d.dispose())
        this._disposables = []
    }
}

const mapStateToProps = (
    state: IState,
    originalProps: IKeyboardInputProps,
): IKeyboardInputViewProps => {
    return {
        ...originalProps,
        top: state.cursorPixelY,
        left: state.cursorPixelX,
        height: state.fontPixelHeight,
        foregroundColor: state.colors["editor.foreground"],
        fontFamily: state.fontFamily,
        fontSize: state.fontSize,
        fontCharacterWidthInPixels: state.fontPixelWidth,
    }
}

export const KeyboardInput = connect(mapStateToProps)(KeyboardInputView)
