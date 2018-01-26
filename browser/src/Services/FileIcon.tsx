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

    isLarge?: boolean

    additionalClassNames?: string
}

export class FileIcon extends React.PureComponent<IFileIconProps, {}> {
    public render(): JSX.Element {
        if (!this.props.fileName) {
            return null
        }

        const icons = getInstance()

        const className =
            icons.getIconClassForFile(this.props.fileName, this.props.language) +
            (this.props.isLarge ? " fa-lg" : "")
        const additionalClasses = this.props.additionalClassNames || ""

        return <i className={className + " " + additionalClasses} aria-hidden={true} />
    }
}

export const getFileIcon = (fileName: string) => <FileIcon fileName={fileName} isLarge={true} />
