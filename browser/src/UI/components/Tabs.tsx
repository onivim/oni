/**
 * Tabs.tsx
 */

import * as React from "react"
// import { connect } from "react-redux"

// import * as Selectors from "./../Selectors"

export class Tabs extends React.PureComponent<void, void> {
    public render(): JSX.Element {

        const tabBorderStyle = {
            "borderBottom": "4px solid rgb(40, 44, 52)",
        }

        return <div className="tabs horizontal enable-mouse" style={tabBorderStyle}>
            <div className="tab not-selected">
                <div className="name">App.ts</div>
            </div>
            <div className="tab selected">
                <div className="name">NeovimInstance.ts</div>
            </div>
            <div className="tab not-selected">
                <div className="name">Test.ts</div>
            </div>
        </div>
    }
}

// const mapStateToProps = (state: State.IState): IActiveWindowProps => {
//     return {
//         dimensions: Selectors.getActiveWindowDimensions(state),
//     }
// }

// export const ActiveWindowContainer = connect(mapStateToProps)(ActiveWindow)
