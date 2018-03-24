import * as React from "react"
import * as types from "vscode-languageserver-types"

import { ErrorIcon } from "./Error"

import { getColorFromSeverity } from "./../../Services/Diagnostics"
import { styled } from "./common"

const Diagnostic = styled.div`
    margin: 8px;
    display: flex;
    flex-direction: row;
`

const ErrorIconWrapper = styled.div`
    margin-right: 8px;
`

export interface IErrorInfoProps {
    style: React.CSSProperties
    errors: types.Diagnostic[]
}

/**
 * Helper component to render errors in the QuickInfo bubble
 */
export class ErrorInfo extends React.PureComponent<IErrorInfoProps, {}> {
    public render(): null | JSX.Element {
        if (!this.props.errors) {
            return null
        }

        const errs = this.props.errors.map(e => (
            <Diagnostic>
                <ErrorIconWrapper>
                    <ErrorIcon color={getColorFromSeverity(e.severity)} />
                </ErrorIconWrapper>
                <span>{e.message}</span>
            </Diagnostic>
        ))

        const style = this.props.style || {}

        return <div style={style}>{errs}</div>
    }
}
