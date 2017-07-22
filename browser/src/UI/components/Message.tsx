import * as React from "react"

// import { connect } from "react-redux"

// import * as _ from "lodash"

// import * as ActionCreators from "./../ActionCreators"
// import * as State from "./../State"

import { Visible } from "./Visible"

/**
 * Popup menu
 */
require("./Message.less") // tslint:disable-line no-var-requires

// export interface IMenuProps {
//     visible: boolean
//     items: string[]
// }

export class Message extends React.Component<void, void> {

    public render(): null | JSX.Element {
        return <Visible visible={true}>
            <div className="message enable-mouse">
                <div className="spacer" />

                <div className="contents" >
                    <div className="primary">
                        <div className="text">
                            Go language server failed to start
                        </div>
                        <div className="buttons">
                            <div className="button">Debug</div>
                            <div className="button">Close</div>
                        </div>
                    </div>
                    <div className="details">
                    </div>
                </div>
                <div className="spacer" />
            </div>
        </Visible >
    }
}
