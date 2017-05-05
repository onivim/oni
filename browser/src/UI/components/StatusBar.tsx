import * as React from "react"

require("./StatusBar.less") // tslint:disable-line no-var-requires

import { StatusBarAlignment } from "./../State"

export interface StatusBarProps {
    items: StatusBarItemProps[]
}

export interface StatusBarItemProps {
    alignment: StatusBarAlignment
    contentsHTML: string
    id: string
    priority: number
}

export class StatusBar extends React.PureComponent<StatusBarProps, void> {
    public render() {
        return <div className="status-bar">
            <div className="status-bar-container left">
                <div className="status-bar-item">
                    <span><i className="fa fa-bolt"></i> typescript</span>
                </div>
                {this.props.items.map((item) => <StatusBarItem {...item} />)}
            </div>
            <div className="status-bar-container center">
            </div>
            <div className="status-bar-container right">
                <div className="status-bar-item">
                    <span><i className="fa fa-code-fork"></i> master</span>
                </div>
                <div className="status-bar-item">
                    <span>12, 29</span>
                </div>
                <div className="status-bar-item">
                    <span>INSERT</span>
                </div>
            </div>
        </div>
    }
}

const createMarkup = (html: string) => ({ __html: html })

export class StatusBarItem extends React.PureComponent<StatusBarItemProps, void> {
    public render() {
        return <div className="status-bar-item" dangerouslySetInnerHTML={createMarkup(this.props.contentsHTML)} />
    }
}
