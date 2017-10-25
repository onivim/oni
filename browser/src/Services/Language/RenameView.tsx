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

        return <div className="rename">
                    <div>Rename:</div>
                    <TextInput {...this.props} />
                </div>
    }
}

