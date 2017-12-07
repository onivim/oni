/**
 * Icons
 *
 * - Data source for icons present in Oni
 * - Loads icons based on the `ui.iconTheme` configuration setting
 */

import * as React from "react"

import { getInstance } from "./IconThemes"

export interface IFileIconProps {
    fileName: string
    language?: string
}

export class FileIcon extends React.PureComponent<IFileIconProps, {}> {
    public render(): JSX.Element {

        const icons = getInstance()

        const className = icons.getIconClassForFile(this.props.fileName, this.props.language)

        return <i className={className} aria-hidden={true} />
    }
}
