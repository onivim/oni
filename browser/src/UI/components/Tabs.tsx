/**
 * Tabs.tsx
 */

import * as path from "path"

import * as React from "react"
import { connect } from "react-redux"

import * as State from "./../State"

// import * as Selectors from "./../Selectors"

export class Tabs extends React.PureComponent<State.ITabState, void> {
    public render(): JSX.Element {

        const tabBorderStyle = {
            "borderBottom": "4px solid rgb(40, 44, 52)",
        }

        const tabs = this.props.tabs.map((t) => {

            const isSelected = t.id === this.props.selectedTabId

            const className = isSelected ? "tab selected" : "tab not-selected"

            const normalizedName = path.basename(t.name)

            return <div className={className}>
                <div className="name">{normalizedName}</div>
            </div>

        })

        return <div className="tabs horizontal enable-mouse" style={tabBorderStyle}>
            {tabs}
        </div>
    }
}

const mapStateToProps = (state: State.IState): State.ITabState => {
    return state.tabState
}

export const TabsContainer = connect(mapStateToProps)(Tabs)
