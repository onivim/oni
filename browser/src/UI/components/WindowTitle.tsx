/**
 * WindowTitle.tsx
 *
 * Renders the title bar (OSX only)
 */

import * as React from "react"

import { connect } from "react-redux"

import { commandManager } from "./../../Services/CommandManager"
import * as State from "./../Shell/ShellState"
import styled from "./common"

export interface IWindowTitleViewProps {
    visible: boolean
    title: string
}

const WindowTitleContainer = styled.div`
    height: 22px;
    padding: 3px 0;
    line-height: 22px;
    zoom: 1; /* Dont allow this to be impacted by zoom */
    background-color: ${p => p.theme["title.background"]};
    color: ${p => p.theme["title.foreground"]};
    text-align: center;
    -webkit-app-region: drag;
    user-select: none;
    pointer-events: all;
`

const onDoubleClick = () => {
    commandManager.executeCommand("oni.editor.maximize")
}

export const WindowTitleView = (props: IWindowTitleViewProps) => {
    return (
        props.visible && (
            <WindowTitleContainer id="oni-titlebar" onDoubleClick={onDoubleClick}>
                {props.title}
            </WindowTitleContainer>
        )
    )
}

export interface IWindowTitleProps {
    visible: boolean
}

export const mapStateToProps = (
    state: State.IState,
    props: IWindowTitleProps,
): IWindowTitleViewProps => {
    return {
        visible: props.visible && !state.isFullScreen,
        title: state.windowTitle,
    }
}

export const WindowTitle = connect(mapStateToProps)(WindowTitleView)
