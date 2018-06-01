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

type StyleProps = Pick<IErrorInfoProps, "hasQuickInfo">

const DiagnosticContainer = styled<StyleProps, "div">("div")`
    user-select: none;
    cursor: default;
    border-bottom: ${p => (p.hasQuickInfo ? `1px solid ${p.theme["toolTip.border"]}` : "")};
`

const Diagnostic = styled.div`
    margin: 8px;
    display: flex;
    flex-direction: row;
`

/**
 * Helper component to render errors in the QuickInfo bubble
 */
export const ErrorInfo = (props: IErrorInfoProps) => {
    return (
        props.errors && (
            <DiagnosticContainer hasQuickInfo={props.hasQuickInfo}>
                {props.errors.map((e, idx) => (
                    <Diagnostic key={e.code + e.message + e.source + idx}>
                        <ErrorIcon color={getColorFromSeverity(e.severity)} />
                        <DiagnosticMessage>{e.message}</DiagnosticMessage>
                    </Diagnostic>
                ))}
            </DiagnosticContainer>
        )
    )
}
