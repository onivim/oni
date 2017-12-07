/**
 * Icons
 *
 * - Data source for icons present in Oni
 * - Loads icons based on the `ui.iconTheme` configuration setting
 */

import * as React from "react"

import { IIconInfo } from "./IconThemes"

export interface IFileIconProps {
    icon: IIconInfo
}

export class FileIcon extends React.PureComponent<IFileIconProps, {}> {
    public render(): JSX.Element {
        return <div>{this.props.icon.fontCharacter}</div>
    }
}
