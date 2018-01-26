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
        return (
            <div className="rename">
                <TextInput {...this.props} defaultValue={this.props.tokenName} />
            </div>
        )
    }
}
