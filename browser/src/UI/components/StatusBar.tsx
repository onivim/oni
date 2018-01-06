import styled, { keyframes } from "styled-components"

import * as keys from "lodash/keys"
import * as React from "react"

import { connect } from "react-redux"

import { addDefaultUnitIfNeeded } from "./../../Font"
import { withProps } from "./common"
import StatusResize from "./StatusResize"
import WithWidth from "./WithWidth"

import { IState, StatusBarAlignment } from "./../Shell/ShellState"

interface StatusBarStyleProps {
    fontSize: string
    fontFamily: string
    className?: string
}

export interface StatusBarProps extends StatusBarStyleProps {
    items: StatusBarItemProps[]
    enabled: boolean
}

export interface StatusBarItemProps {
    alignment: StatusBarAlignment
    contents: JSX.Element
    id: string
    priority: number
    count?: number
    measureRef?: any
    passWidth?: (data: IChildDimensions) => void
    width?: number
    hide?: boolean
}

interface IChildDimensions {
    direction: string
    width: number
    id: string
    priority: number
    hide: boolean
}

interface IStatusComponent {
    maxWidth?: string
}

const enterKeyframes = keyframes`
    0% { transform: translateY(4px); opacity: 0; }
    100% { transform: translateY(0px); opacity: 1; }
`

const StatusBarComponent = withProps<IStatusComponent>(styled.div)`
    animation: ${enterKeyframes} 0.2s ease-in;
    white-space: nowrap;
    padding-left: 8px;
    padding-right: 8px;
    flex: 0 1 auto;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    &:hover {
        background-color: rgba(100, 100, 100, 0.2);
    }`

const StatusBarContainer = withProps<StatusBarStyleProps>(styled.div)`
    font-family: ${({ fontFamily }) => fontFamily};
    font-size: ${({ fontSize }) => fontSize };
    background-color: ${({ theme }) => theme.background };
    color: ${({ theme }) => theme.foreground};
    box-shadow: 0 -8px 20px 0 rgba(0, 0, 0, 0.2);
    pointer-events: auto;
    height: 2em;
    width: 100%;
    position: relative;
    user-select: none;
`

/* `status-bar-inner` is used for performance reasons,
to move the status bar to its own layer. This keeps changes
from the status-bar layer from cause a repaint in the entire editor */
const StatusBarInner = styled.div`
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`

export class StatusBar extends React.PureComponent<StatusBarProps, {}> {
    public render() {
        if (!this.props.enabled) {
            return null
        }

        const statusBarItems = this.props.items || []
        const leftItems = statusBarItems
            .filter(item => item.alignment === StatusBarAlignment.Left)
            .sort((a, b) => a.priority - b.priority)

        const rightItems = statusBarItems
            .filter(item => item.alignment === StatusBarAlignment.Right)
            .sort((a, b) => b.priority - a.priority)

        const statusBarProps = {
            fontFamily: this.props.fontFamily,
            fontSize: this.props.fontSize,
        }

        return (
            <StatusBarContainer {...statusBarProps}>
                <StatusBarInner>
                    <StatusResize direction="flex-start">
                        {leftItems.map(item => <ItemWithWidth {...item} key={item.id} />)}
                    </StatusResize>
                    <StatusResize direction="center" />
                    <StatusResize direction="flex-end">
                        {rightItems.map(item => <ItemWithWidth {...item} key={item.id} />)}
                    </StatusResize>
                </StatusBarInner>
            </StatusBarContainer>
        )
    }
}

export class StatusBarItem extends React.PureComponent<StatusBarItemProps, {}> {
    public componentDidMount() {
        this.props.passWidth({
            width: this.props.width,
            direction: this.props.alignment === 0 ? "left" : "right",
            id: this.props.id,
            priority: this.props.priority,
            hide: this.props.hide,
        })
    }
    public componentWillReceiveProps(nextProps: StatusBarItemProps) {
        if (nextProps.width !== this.props.width) {
            this.props.passWidth({
                width: nextProps.width,
                direction: nextProps.alignment === 0 ? "left" : "right",
                id: nextProps.id,
                priority: nextProps.priority,
                hide: nextProps.hide,
            })
        }
    }

    public render() {
        return this.props.hide ? null : (
            <StatusBarComponent innerRef={this.props.measureRef}>
                {this.props.contents}
            </StatusBarComponent>
        )
    }
}
const ItemWithWidth = WithWidth(StatusBarItem)

import { createSelector } from "reselect"

const getStatusBar = (state: IState) => state.statusBar

const getStatusBarItems = createSelector([getStatusBar], statusBar => {
    const statusKeys = keys(statusBar)

    const statusBarItems = statusKeys.map(k => ({
        id: k,
        ...statusBar[k],
    }))

    return statusBarItems
})

const mapStateToProps = (state: IState): StatusBarProps => {
    const statusBarItems = getStatusBarItems(state)

    return {
        fontFamily: state.configuration["ui.fontFamily"],
        fontSize:
            state.configuration["statusbar.fontSize"] ||
            addDefaultUnitIfNeeded(state.configuration["ui.fontSize"]),
        items: statusBarItems,
        enabled: state.configuration["statusbar.enabled"],
    }
}

export default connect(mapStateToProps)(StatusBar)
