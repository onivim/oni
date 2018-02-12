/**
 * RenameView.tsx
 *
 * Contents of the Rename tooltip
 */

import * as React from "react"

import styled from "styled-components"

import { TextInputView } from "./../../UI/components/LightweightText"

export interface IRenameViewProps {
    tokenName: string
    onComplete: (val: string) => void
    onCancel: () => void
}

const ToolTipWrapper = styled.div`
    background-color: ${props => props.theme["toolTip.background"]};
    color: ${props => props.theme["toolTip.foreground"]};

    input {
        background-color: ${props => props.theme["toolTip.background"]};
        color: ${props => props.theme["toolTip.foreground"]};
    }
`

export class RenameView extends React.PureComponent<IRenameViewProps, {}> {
    public render(): JSX.Element {
        return (
            <ToolTipWrapper className="rename">
                <TextInputView {...this.props} defaultValue={this.props.tokenName} />
            </ToolTipWrapper>
        )
    }
}
