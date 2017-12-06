/**
 * UI/index.tsx
 *
 * Root setup & state for the UI
 * - Top-level render function lives here
 */

import * as React from "react"
import { connect } from "react-redux"

import { Event, IEvent } from "oni-types"

import { Icon, IconSize } from "./../../UI/Icon"
import * as State from "./../../UI/State"

import { KeyboardInputView } from "./../../Editor/KeyboardInput"

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

export interface ISidebarViewProps extends ISidebarContainerProps {
    backgroundColor: string
    foregroundColor: string
    width: string
    visible: boolean
}

export interface ISidebarContainerProps {
    onEnter: IEvent<void>
    onKeyDown: (key: string) => void
}

export class SidebarView extends React.PureComponent<ISidebarViewProps, {}> {
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
                <div className="icons">
                <SidebarIcon iconName={"files-o"} active={true}/>
                <SidebarIcon iconName={"search"} active={false}/>
                <SidebarIcon iconName={"graduation-cap"} active={false}/>
                <SidebarIcon iconName={"code-fork"} active={false}/>
                <SidebarIcon iconName={"bug"} active={false}/>
                </div>
                <div className="input">
                    <KeyboardInputView
                        top={0}
        left={0}
        height={12}
        onActivate={this.props.onEnter}
        onKeyDown={this.props.onKeyDown}
        foregroundColor={"white"}
        fontFamily={"Segoe UI"}
        fontSize={"12px"}
        fontCharacterWidthInPixels={12}

                        />
                </div>
            </div>

    }
}

export const mapStateToProps = (state: State.IState, containerProps: ISidebarContainerProps): ISidebarViewProps => {
    return {
        ...containerProps,
        visible: state.configuration["experimental.sidebar.enabled"],
        backgroundColor: state.colors.background,
        foregroundColor: state.colors.foreground,
        width: state.configuration["sidebar.width"],
    }
}

const Sidebar = connect(mapStateToProps)(SidebarView)

export class SidebarSplit {

    private _onEnterEvent: Event<void> = new Event<void>()

    public enter(): void {
        this._onEnterEvent.dispatch()
        // alert("hi")
    }

    public leave(): void {
        // alert("bye")
    }

    public render(): JSX.Element {
        return <Sidebar onKeyDown={(key) => this._onKeyDown(key)} onEnter={this._onEnterEvent}/>
    }

    private _onKeyDown(key: string): void {
        console.log("key down!")
    }
}
