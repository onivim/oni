/**
 * NeovimEditorLoadingOverlay
 *
 * Overlay shown over the editor window while initializing (loading Neovim)
 */

import * as React from "react"
import { connect } from "react-redux"

import * as State from "./NeovimEditorStore"

import styled from "styled-components"
import { withProps } from "./../../UI/components/common"

const LoadingSpinnerWrapper = withProps<{}>(styled.div)`
    background-color: ${props => props.theme["editor.background"]};
    color: ${props => props.theme["editor.foreground"]};
    display: flex;
    justify-content: center;
    align-items: center;

    opacity: 1;
    transition: opacity 0.15s ease-in;

    &.loaded {
        opacity: 0;
        pointer-events: none;
    }
`

export const NeovimEditorLoadingOverlayView = (props: {visible: boolean}): JSX.Element => {
        const className = props.visible ? "stack layer" : " stack layer loaded"

        return <LoadingSpinnerWrapper className={className} />
}

export const mapStateToProps = (state: State.IState): { visible: boolean } => {
    return { visible: !state.isLoaded }
}

export const NeovimEditorLoadingOverlay = connect(mapStateToProps)(NeovimEditorLoadingOverlayView)
