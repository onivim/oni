/**
 * NeovimSurface.tsx
 *
 * UI layer for the Neovim editor surface
 */

import * as React from "react"

import styled, { keyframes } from "styled-components"

import { Icon, IconSize } from "./../Icon"

const keys = keyframes`
    0% { transform: rotateZ(0deg); }
    100% { transform: rotateZ(359deg); }
`

const LoadingIconWrapper = styled.div`
    opacity: 0.1;

    i {
        animation: ${keys} 1.5s linear infinite;
    }
`

export class LoadingSpinner extends React.PureComponent<{}, {}> {
    public render(): JSX.Element {
        return (
            <LoadingIconWrapper>
                <Icon name="circle-o-notch" size={IconSize.FourX} />
            </LoadingIconWrapper>
        )
    }
}
