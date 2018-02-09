/**
 * Component displaying an error message when there is a failure
 */

import * as React from "react"
import styled from "styled-components"

export interface RedScreenOfDoomViewProps {
    error: Error
    info: React.ErrorInfo
}

const RedScreenWrapper = styled.div`
    width: 100%;
    height: 100%;
    background-color: red;
    color: rgb(200, 200, 200);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

export class RedScreenOfDoomView extends React.PureComponent<RedScreenOfViewProps> {
    public render(): JSX.Element {
        return (
            <RedScreenWrapper>
                <div>Error:</div>
                <div>{this.props.error.toString()}</div>
                <div>Info:</div>
                <div>{this.props.info.toString()}</div>
            </RedScreenWrapper>
        )
    }
}
