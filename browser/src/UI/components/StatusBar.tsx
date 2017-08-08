
import * as electron from "electron"

import * as _ from "lodash"
import * as React from "react"

import { connect } from "react-redux"

import * as State from "./../State"

require("./StatusBar.less") // tslint:disable-line no-var-requires

import { StatusBarAlignment } from "./../State"

export interface StatusBarProps {
    items: StatusBarItemProps[]
    enabled: boolean
    fontSize: string
}

export interface StatusBarItemProps {
    alignment: StatusBarAlignment
    contents: JSX.Element
    id: string
    priority: number
}

export class StatusBar extends React.PureComponent<StatusBarProps, void> {

    public render() {
        if (!this.props.enabled) {
            return null
        }

        const statusBarItems = this.props.items || []
        const leftItems = statusBarItems
            .filter((item) => item.alignment === StatusBarAlignment.Left)
            .sort((a, b) => a.priority - b.priority)

        const rightItems = statusBarItems
            .filter((item) => item.alignment === StatusBarAlignment.Right)
            .sort((a, b) => b.priority - a.priority)

        const statusBarStyle = {
            "fontSize": this.props.fontSize,
        }

        return <div className="status-bar enable-mouse" style={statusBarStyle}>
            <div className="status-bar-inner">
                <div className="status-bar-container left">
                    {leftItems.map((item) => <StatusBarItem {...item} />)}
                </div>
                <div className="status-bar-container center">
                </div>
                <div className="status-bar-container right">
                    {rightItems.map((item) => <StatusBarItem {...item} />)}
                    <div className="status-bar-item" onClick={() => this._openGithub()}>
                        <span><i className="fa fa-github" /></span>
                    </div>
                </div>
            </div>
        </div>
    }

    private _openGithub(): void {
        // TODO: Open this in an internal window once that capability is available
        electron.shell.openExternal("https://www.github.com/extr0py/oni")
    }
}

export class StatusBarItem extends React.PureComponent<StatusBarItemProps, void> {
    public render() {
        return <div className="status-bar-item">{this.props.contents}</div>
    }
}

import { createSelector } from "reselect"

const getStatusBar = (state: State.IState) => state.statusBar

const getStatusBarItems = createSelector(
    [getStatusBar],
    (statusBar) => {
        const keys = _.keys(statusBar)

        const statusBarItems = keys.map((k) => ({
            id: k,
            ...statusBar[k],
        }))

        return statusBarItems
    })

const mapStateToProps = (state: State.IState): StatusBarProps => {

    const statusBarItems = getStatusBarItems(state)

    return {
        fontSize: state.configuration["statusbar.fontSize"],
        items: statusBarItems,
        enabled: state.configuration["statusbar.enabled"],
    }
}

export default connect(mapStateToProps)(StatusBar)
