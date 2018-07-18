import * as React from "react"

import { focusManager } from "./../../Services/FocusManager"
import { styled, withProps } from "./../components/common"

export interface ITextInputViewProps {
    onCancel?: () => void
    onComplete?: (result: string) => void
    onChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void
    styles?: any

    defaultValue?: string
}

export interface IInputProps extends ITextInputViewProps {
    inputStyles?: any
    onKeyDown: (evt: React.KeyboardEvent<HTMLInputElement>) => void
    onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void
    onFocus: (evt: React.FocusEvent<HTMLInputElement>) => void
}

const Input = withProps<IInputProps>(styled.input)`
    ${p => p.inputStyles};
`

// TODO: Is there a better value for this?
const WordRegex = /[$_a-zA-Z0-9]/i

/**
 * TextInputView is a lightweight input control, that implements some
 * common functionality (like focus management, key handling)
 */
export class TextInputView extends React.PureComponent<ITextInputViewProps, {}> {
    private _element: HTMLInputElement

    public componentDidMount(): void {
        if (this._element) {
            focusManager.pushFocus(this._element)
        }
    }

    public render(): JSX.Element {
        const inputStyle: React.CSSProperties = {
            outline: "none",
            border: "0px",
            transform: "translateY(0px)",
        }

        const defaultValue = this.props.defaultValue || ""

        return (
            <div className="input-container enable-mouse">
                <Input
                    type="text"
                    inputStyles={this.props.styles}
                    style={inputStyle}
                    placeholder={defaultValue}
                    onKeyDown={this._onKeyDown}
                    onChange={this._onChange}
                    onFocus={(evt: React.FocusEvent<HTMLInputElement>) =>
                        evt.currentTarget.select()
                    }
                    innerRef={(elem: HTMLInputElement) => (this._element = elem)}
                />
            </div>
        )
    }

    public componentWillUnmount(): void {
        if (this._element) {
            focusManager.popFocus(this._element)
            this._element = null
        }
    }

    private _onChange = (changeEvent: React.ChangeEvent<HTMLInputElement>): void => {
        if (this.props.onChange) {
            this.props.onChange(changeEvent)
        }
    }

    private _cancel = (): void => {
        if (this.props.onCancel) {
            this.props.onCancel()
        }
    }

    private _onKeyDown = (keyboardEvent: React.KeyboardEvent<HTMLInputElement>): void => {
        if (keyboardEvent.keyCode === 27) {
            this._cancel()
            return
        }

        if (keyboardEvent.keyCode === 13) {
            if (this.props.onComplete) {
                this.props.onComplete(this._element.value)
            }
            return
        }

        if (this._element && keyboardEvent.ctrlKey) {
            switch (keyboardEvent.key) {
                case "[":
                case "c":
                    this._cancel()
                    break
                case "u": {
                    this._element.value = ""
                    break
                }
                case "h": {
                    const previousValue = this._element.value

                    if (previousValue.length > 0) {
                        this._element.value = previousValue.substring(0, previousValue.length - 1)
                    }
                    break
                }
                case "w":
                    {
                        const previousValue = this._element.value
                        let idx = previousValue.length - 1

                        while (idx > 0) {
                            if (!previousValue[idx].match(WordRegex)) {
                                break
                            }

                            idx--
                        }

                        this._element.value = previousValue.substring(0, idx)
                    }
                    break
                default:
                    return
            }
        }
    }
}

export default TextInputView
