import * as React from "react"
import { connect } from "react-redux"

import { IState } from "./../State"
import * as Selectors from "./../Selectors"

import { CursorPositioner } from "./CursorPositioner"

import * as types from "vscode-languageserver-types"

export interface IErrorInfoProps {
    visible: boolean

    backgroundColor: string
    foregroundColor: string

    errors: types.Diagnostic[]
}

export class ErrorInfo extends React.PureComponent<IErrorInfoProps, void> {

    public render(): null | JSX.Element {
        // if (!this.props.elements || !this.props.elements.length) {
        //     return null
        // }

        if (!this.props.errors) {
            return null
        }

        const innerCommonStyle: React.CSSProperties = {
            "opacity": this.props.visible ? 1 : 0,
            backgroundColor: this.props.backgroundColor,
            color: this.props.foregroundColor,
        }


        const errors = this.props.errors.map((e) => <div>{e.message}</div>)

        return <CursorPositioner>
            <div key={"errorinfo-container"} className="errorinfo-container enable-mouse">
                <div key={"errorinfo"} style={innerCommonStyle} className="errorinfo">
                {errors}
                </div>
            </div>
        </CursorPositioner>
    }
}

const isInRange = (line: number, column: number, range: types.Range): boolean => {
    return (line >= range.start.line && column >= range.start.character
        && line <= range.end.line && column <= range.end.character)
}

const mapStateToErrorInfoProps = (state: IState): IErrorInfoProps => {

    const activeWindow = Selectors.getActiveWindow(state)

    if (!activeWindow) {
        return {
            visible: false,
            errors: [],
            foregroundColor: "white",
            backgroundColor: "black",
        }
    }

    const errors = Selectors.getErrors(state)
    const { file, line, column } = activeWindow

    const allErrors = Selectors.getAllErrorsForFile(file, errors)

    const errorsForPosition = allErrors.filter((diag) => isInRange(line - 1, column - 1, diag.range))

    return {
        visible: true,
        errors: errorsForPosition,
        foregroundColor: state.foregroundColor,
        backgroundColor: state.backgroundColor,
    }
}

export const ErrorInfoContainer = connect(mapStateToErrorInfoProps)(ErrorInfo)
