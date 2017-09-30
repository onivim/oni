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

import { keyEventToVimKey } from "./../Input/Keyboard"
import { focusManager } from "./../Services/FocusManager"
import { IState } from "./../UI/State"

import { measureFont } from "./../Font"
import * as UI from "./../UI"

interface IKeyboardInputViewProps {
    top: number
    left: number
    height: number
    onKeyDown?: (key: string) => void
    foregroundColor: string
    imeEnabled: boolean
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
    onKeyDown?: (key: string) => void
}

/**
 * KeyboardInput
 *
 * Helper for managing state and sanitizing input from dead keys, IME, etc
 */
class KeyboardInputView extends React.PureComponent<IKeyboardInputViewProps, IKeyboardInputViewState> {
    private _keyboardElement: HTMLInputElement

    constructor() {
        super()

        this.state = {
            isComposing: false,
            compositionTextWidthInPixels: 0,
        }
    }

    public focus() {
        this._keyboardElement.focus()
    }

    public componentDidMount(): void {
        if (this._keyboardElement) {
            focusManager.pushFocus(this._keyboardElement)
        }
    }

    public render(): JSX.Element {
        const opacity = this.state.isComposing ? 0.8 : 0

        const containerStyle: React.CSSProperties = {
            position: "absolute",
            top: this.props.top.toString() + "px",
            left: this.props.left.toString() + "px",
            height: this.props.height.toString() + "px",
            pointerEvents: "none",
            opacity,
            width: "100%",
        }

        const inputStyle: React.CSSProperties = {
            position: "absolute",
            padding: "0px",
            width: "100%",
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
            padding: "2px",
            marginTop: "-2px",
            marginLeft: "-2px",
            width: this.state.compositionTextWidthInPixels + "px",
        }

        // IME is disabled for 'password' type fields
        const inputType = this.props.imeEnabled ? "text" : "password"

        return <div style={containerStyle}>
            <div style={backgroundStyle} />
            <input
                style={inputStyle}
                ref={(elem) => this._keyboardElement = elem}
                type={inputType}
                onKeyDown={(evt) => this._onKeyDown(evt)}
                onCompositionEnd={(evt) => this._onCompositionEnd(evt)}
                onCompositionUpdate={(evt) => this._onCompositionUpdate(evt)}
                onCompositionStart={(evt) => this._onCompositionStart(evt)}
                onInput={(evt) => this._onInput(evt)} />
        </div>
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

        const key = keyEventToVimKey(evt.nativeEvent)

        if (!key) {
            return
        }

        const imeDisabled = !this.props.imeEnabled
        const isMetaCommand = key.length > 1

        // If ime is disabled, always pass the key event through...
        // Otherwise, we'll let the `input` handler take care of it,
        // unless it is a keystroke containing meta characters
        if (imeDisabled || isMetaCommand) {
            this._commit(key)
            evt.preventDefault()
            return
        }
    }

    private _onCompositionStart(evt: React.CompositionEvent<HTMLInputElement>) {
        UI.Actions.setImeActive(true)
        this.setState({
            isComposing: true,
        })
    }

    private _onCompositionUpdate(evt: React.CompositionEvent<HTMLInputElement>) {
        if (this._keyboardElement) {

            const measurements = measureFont(this.props.fontSize, this.props.fontFamily, this._keyboardElement.value)

            // Add some padding for an extra character to the end of the input box
            const roomForNextCharacter = this.props.fontCharacterWidthInPixels
            const width = Math.ceil(measurements.width) + roomForNextCharacter

            this.setState({
                compositionTextWidthInPixels: width,
            })
        }
    }

    private _onCompositionEnd(evt: React.CompositionEvent<HTMLInputElement>) {
        UI.Actions.setImeActive(false)
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
}

const mapStateToProps = (state: IState, originalProps: IKeyboardInputProps): IKeyboardInputViewProps => {
    return {
        ...originalProps,
        top: state.cursorPixelY,
        left: state.cursorPixelX,
        height: state.fontPixelHeight,
        foregroundColor: state.foregroundColor,
        imeEnabled: state.mode === "insert",
        fontFamily: state.fontFamily,
        fontSize: state.fontSize,
        fontCharacterWidthInPixels: state.fontPixelWidth,
    }
}

export const KeyboardInput = connect(mapStateToProps)(KeyboardInputView)
