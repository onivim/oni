/**
 * RenameView.tsx
 *
 * Contents of the Rename tooltip
 */

import * as React from "react"

import { TextInput } from "./../../UI/components/LightweightText"

export interface IRenameViewProps {
    tokenName: string
    onComplete: (val: string) => void
}

export class RenameView extends React.PureComponent<IRenameViewProps, {}> {

    public render(): JSX.Element {

        const titleStyle = {
            marginBottom: "8px",
        }

        const renameText = "Rename '" + this.props.tokenName + "' to:"

        return <div className="rename">
                    <div style={titleStyle}>{renameText}</div>
                    <TextInput {...this.props} defaultValue={this.props.tokenName} />
                </div>
    }
}
