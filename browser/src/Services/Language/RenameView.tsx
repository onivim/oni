/**
 * RenameView.tsx
 *
 * Contents of the Rename tooltip
 */

import * as React from "react"

import { TextInput } from "./../../UI/components/LightweightText"

export interface IRenameViewProps {
    onComplete: (val: string) => void
}

export class RenameView extends React.PureComponent<IRenameViewProps, void> {

    public render(): JSX.Element {

        const titleStyle = {
            marginBottom: "8px",
        }

        return <div className="rename">
                    <div style={titleStyle}>Rename:</div>
                    <TextInput {...this.props} />
                </div>
    }
}
