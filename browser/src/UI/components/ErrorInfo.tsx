import * as React from "react"
import * as types from "vscode-languageserver-types"

import styled from "./common"
import { ErrorIcon } from "./Error"

import { getColorFromSeverity } from "./../../Services/Diagnostics"

export interface IErrorInfoProps {
    hasQuickInfo: boolean
    errors: types.Diagnostic[]
}

const DiagnosticMessage = styled.span`
    margin-left: 1em;
`

const DiagnosticContainer = styled<{ hasQuickInfo: boolean }, "div">("div")`
    border-bottom: ${p => (p.hasQuickInfo ? `1px solid ${p.theme["toolTip.border"]}` : "")};
    user-select: none;
    cursor: default;
`

/**
 * Helper component to render errors in the QuickInfo bubble
 */
export class ErrorInfo extends React.PureComponent<IErrorInfoProps, {}> {
    public render(): null | JSX.Element {
        if (!this.props.errors) {
            return null
        }

        const errs = this.props.errors.map((e, idx) => (
            <div className="diagnostic" key={e.code + e.message + e.source + idx}>
                <ErrorIcon color={getColorFromSeverity(e.severity)} />
                <DiagnosticMessage>{e.message}</DiagnosticMessage>
            </div>
        ))

        return (
            <DiagnosticContainer hasQuickInfo={this.props.hasQuickInfo}>{errs}</DiagnosticContainer>
        )
    }
}
