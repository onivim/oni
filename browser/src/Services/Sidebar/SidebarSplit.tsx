/**
 * UI/index.tsx
 *
 * Root setup & state for the UI
 * - Top-level render function lives here
 */

import * as React from "react"

import { connect } from "react-redux"

import { Icon, IconSize } from "./../../UI/Icon"
import * as State from "./../../UI/State"

require("./Sidebar.less") // tslint:disable-line

export interface ISidebarIconProps {
    active: boolean
    iconName: string
}

export class SidebarIcon extends React.PureComponent<ISidebarIconProps, {}> {
    public render(): JSX.Element {

        const className = "sidebar-icon-container " + (this.props.active ? "active" : "inactive")
        return <div className={className} tabIndex={0}>
                    <div className="sidebar-icon">
                        <Icon name={this.props.iconName} size={IconSize.Large} />
                    </div>
                </div>
    }
}

export interface ISidebarProps {
    backgroundColor: string
    foregroundColor: string
    width: string
    visible: boolean
}

export class SidebarView extends React.PureComponent<ISidebarProps, {}> {
    public render(): JSX.Element {
        const style: React.CSSProperties = {
            color: this.props.foregroundColor,
            backgroundColor: this.props.backgroundColor,
            width: this.props.width,
        }

        if (!this.props.visible) {
            return null
        }

        return <div className="sidebar enable-mouse" style={style}>
                <SidebarIcon iconName={"files-o"} active={true}/>
                <SidebarIcon iconName={"search"} active={false}/>
                <SidebarIcon iconName={"graduation-cap"} active={false}/>
                <SidebarIcon iconName={"code-fork"} active={false}/>
                <SidebarIcon iconName={"bug"} active={false}/>
            </div>

    }
}

export const mapStateToProps = (state: State.IState): ISidebarProps => {
    return {
        visible: state.configuration["experimental.sidebar.enabled"],
        backgroundColor: state.colors.background,
        foregroundColor: state.colors.foreground,
        width: state.configuration["sidebar.width"],
    }
}

const Sidebar = connect(mapStateToProps)(SidebarView)

export class SidebarSplit {
    public render(): JSX.Element {
        return <Sidebar />
    }
}
