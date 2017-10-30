import * as React from "react"
import { connect } from "react-redux"

import * as State from "./../State"

import { focusManager } from "./../../Services/FocusManager"

export interface IToolTipsViewProps {
    onComplete?: (result: string) => void

    defaultValue?: string

    backgroundColor: string
    foregroundColor: string

}

export class TextInputView extends React.PureComponent<IToolTipsViewProps, void> {

    private _element: HTMLInputElement

    public componentDidMount(): void {
        if (this._element) {
            focusManager.pushFocus(this._element)
        }
    }

    public render(): JSX.Element {

        const inputStyle: React.CSSProperties = {
            outline: "none",
            color: this.props.foregroundColor,
            backgroundColor: this.props.backgroundColor,
            border: "1px solid " + this.props.foregroundColor,
            transform: "translateY(0px)",
        }

        const defaultValue = this.props.defaultValue || ""

        return <input type="text"
                    style={inputStyle}
                    placeholder={defaultValue}
                    onFocus={(evt) => evt.currentTarget.select()}
                    ref={(elem) => this._element = elem} />
    }

    public componentWillUnmount(): void {
        if (this._element) {

            if (this.props.onComplete) {
                this.props.onComplete(this._element.value)
            }

            focusManager.popFocus(this._element)
            this._element = null
        }
    }
}

const mapStateToProps = (state: State.IState, originalProps?: Partial<IToolTipsViewProps>) => ({
    ...originalProps,
    backgroundColor: state.backgroundColor,
    foregroundColor: state.foregroundColor,
})

export const TextInput = connect(mapStateToProps)(TextInputView)
