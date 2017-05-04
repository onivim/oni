import * as React from "react"

require("./StatusBar.less")

export class StatusBar extends React.PureComponent<void, void> {

    public render() {
        return <div className="status-bar">
            <div className="status-bar-container left">
                <div className="status-bar-item">
                    <span>C:\oni\browser\src\UI\components\StatusBar.tsx</span>
                </div>
                <div className="status-bar-item">
                    <span><i className="fa fa-bolt"></i> typescript</span>
                </div>
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
