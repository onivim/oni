/**
 * Icons
 *
 * - Data source for icons present in Oni
 * - Loads icons based on the `ui.iconTheme` configuration setting
 */

import * as React from "react"

import { css, keyframes, styled, withProps } from "../UI/components/common"
import { getInstance } from "./IconThemes"

const appearAnimationKeyframes = keyframes`
    0% {
        opacity: 0;
        transform: scale(0.8);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
`

const appearAnimation = css`
    animation-name: ${appearAnimationKeyframes};
    animation-duration: 0.25s;
    animation-timing-function: ease-in;
    animation-fill-mode: forwards;
    opacity: 1;
`

const Icon = withProps<{ playAppearAnimation: boolean }>(styled.i)`
    ${props => (props.playAppearAnimation ? appearAnimation : "")}
`

export interface IFileIconProps {
    fileName: string
    language?: string

    isLarge?: boolean

    playAppearAnimation?: boolean
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

        return (
            <Icon
                playAppearAnimation={!!this.props.playAppearAnimation}
                className={className}
                aria-hidden={true}
            />
        )
    }
}

export const getFileIcon = (fileName: string) => <FileIcon fileName={fileName} isLarge={true} />
