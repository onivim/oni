import * as electron from "electron"

import * as keys from "lodash/keys"
import * as React from "react"

import { connect } from "react-redux"

import { IState, StatusBarAlignment } from "./../State"

import { addDefaultUnitIfNeeded } from "./../../Font"
import StatusResize from "./StatusResize"
import WithContentRect from "./WithContentRect"

require("./StatusBar.less") // tslint:disable-line no-var-requires

export interface StatusBarProps {
    items: StatusBarItemProps[]
    enabled: boolean
    fontSize: string
    fontFamily: string
    backgroundColor: string
    foregroundColor: string
}

export interface StatusBarItemProps {
    alignment: StatusBarAlignment
    contents: JSX.Element
    id: string
    priority: number
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

export class StatusBar extends React.PureComponent<StatusBarProps> {
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

        const statusBarStyle = {
            fontFamily: this.props.fontFamily,
            fontSize: this.props.fontSize,
            backgroundColor: this.props.backgroundColor,
            color: this.props.foregroundColor,
        }

        return (
            <div className="status-bar enable-mouse" style={statusBarStyle}>
                <div className="status-bar-inner">
                    <StatusResize className="status-bar-container left">
                        {leftItems.map(item => <ItemWithWidth {...item} key={item.id} />)}
                    </StatusResize>
                    <div className="status-bar-container center" />
                    <StatusResize className="status-bar-container right">
                        {rightItems.map(item => <ItemWithWidth {...item} key={item.id} />)}
                    </StatusResize>
                    <div className="status-bar-item" onClick={() => this._openGithub()}>
                        <span>
                            <i className="fa fa-github" />
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    private _openGithub(): void {
        // TODO: Open this in an internal window once that capability is available
        electron.shell.openExternal("https://www.github.com/onivim/oni")
    }
}

export class StatusBarItem extends React.Component<StatusBarItemProps, {}> {
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
        // console.log(`${this.props.id} this.props: `, this.props)
        // tslint:disable-next-line
        console.log(`${this.props.id} this.props.hide: `, this.props.hide)
        return this.props.hide ? null : (
            <div ref={this.props.measureRef} className="status-bar-item">
                {this.props.contents}
            </div>
        )
    }
}

const ItemWithWidth = WithContentRect(StatusBarItem)

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
        backgroundColor: state.colors["statusBar.background"],
        foregroundColor: state.colors["statusBar.foreground"],
        fontFamily: state.configuration["ui.fontFamily"],
        fontSize:
            state.configuration["statusbar.fontSize"] ||
            addDefaultUnitIfNeeded(state.configuration["ui.fontSize"]),
        items: statusBarItems,
        enabled: state.configuration["statusbar.enabled"],
    }
}

export default connect(mapStateToProps)(StatusBar)
