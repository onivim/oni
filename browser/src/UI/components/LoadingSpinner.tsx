/**
 * NeovimSurface.tsx
 *
 * UI layer for the Neovim editor surface
 */

import * as React from "react"

import styled, { keyframes } from "styled-components"

import { Icon, IconSize } from "./../Icon"
import { withProps } from "./common"

const keys = keyframes`
    0% { transform: rotateZ(0deg); }
    100% { transform: rotateZ(359deg); }
`

const LoadingIconWrapper = withProps<IProps>(styled.div)`
    opacity: 0.1;
    ${p => p.iconSize && `font-size: ${p.iconSize}`};

    i {
        animation: ${keys} 1.5s linear infinite;
    }
`

interface IProps {
    iconSize?: string
}

export const LoadingSpinner: React.SFC<IProps> = props => (
    <LoadingIconWrapper iconSize={props.iconSize}>
        <Icon name="circle-o-notch" size={IconSize.FourX} />
    </LoadingIconWrapper>
)
