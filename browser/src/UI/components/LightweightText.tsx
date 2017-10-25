import * as React from "react"
// import { connect } from "react-redux"

// import * as State from "./../State"

import { focusManager } from "./../../Services/FocusManager"

// import { CursorPositioner } from "./CursorPositioner"

export interface IToolTipsViewProps {
    onComplete?: (result: string) => void
}

export class TextInput extends React.PureComponent<IToolTipsViewProps, void> {

    private _element: HTMLInputElement

    public componentDidMount(): void {
        if (this._element) {
            focusManager.pushFocus(this._element)
        }
    }

    public render(): JSX.Element {
        return <input type="text"
                    ref={(elem) => this._element = elem} />
    }

    public componentWillUnmount(): void {
        if (this._element) {
            this.props.onComplete && this.props.onComplete(this._element.value)
            focusManager.popFocus(this._element)
            this._element = null
        }
    }
}

