import * as _ from "lodash"
import * as React from "react"

import { connect } from "react-redux"

import * as State from "./../State"

require("./StatusBar.less") // tslint:disable-line no-var-requires

import { StatusBarAlignment } from "./../State"

export interface StatusBarProps {
    items: StatusBarItemProps[]
}

export interface StatusBarItemProps {
    alignment: StatusBarAlignment
    contents: JSX.Element
    id: string
    priority: number
}

export class StatusBar extends React.PureComponent<StatusBarProps, void> {
    public render() {

        const statusBarItems = this.props.items || []
        const leftItems = statusBarItems
                            .filter((item) => item.alignment === StatusBarAlignment.Left)
                            .sort((a, b) => a.priority - b.priority)

        const rightItems = statusBarItems
                            .filter((item) => item.alignment === StatusBarAlignment.Right)
                            .sort((a, b) => b.priority - a.priority)

        return <div className="status-bar">
            <div className="status-bar-container left">
                {leftItems.map((item) => <StatusBarItem {...item} />)}
                <div className="status-bar-item">
                    <span><i className="fa fa-bolt"></i> typescript</span>
                </div>
            </div>
            <div className="status-bar-container center">
            </div>
            <div className="status-bar-container right">
                {rightItems.map((item) => <StatusBarItem {...item} />)}
                <div className="status-bar-item">
                    <span><i className="fa fa-code-fork"></i> master</span>
                </div>
                <div className="status-bar-item">
                    <span><i className="fa fa-github" /></span>
                </div>
            </div>
        </div>
    }
}

export class StatusBarItem extends React.PureComponent<StatusBarItemProps, void> {
    public render() {
        return <div className="status-bar-item">{this.props.contents}</div>
    }
}

const mapStateToProps = (state: State.IState): StatusBarProps => {

    const keys = _.keys(state.statusBar)

    const statusBarItems = keys.map((k) => ({
        id: k,
        ...state.statusBar[k],
    }))

    return {
        items: statusBarItems,
    }
}

export default connect(mapStateToProps)(StatusBar)
