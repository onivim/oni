/**
 * Tabs.tsx
 */

import * as path from "path"

import * as React from "react"
import { connect } from "react-redux"

import * as State from "./../State"

require("./Tabs.less") // tslinst:disable-line no-var-requires

export class Tabs extends React.PureComponent<State.ITabState, void> {
    public render(): JSX.Element {

        const tabBorderStyle = {
            "borderBottom": "4px solid rgb(40, 44, 52)",
        }

        const tabs = this.props.tabs.map((t) => {

            const isSelected = t.id === this.props.selectedTabId
            const normalizedName = path.basename(t.name)

            return <Tab isSelected={isSelected} name={normalizedName} />
        })

        return <div className="tabs horizontal enable-mouse" style={tabBorderStyle}>
            {tabs}
        </div>
    }
}

export interface ITabProps {
    name: string
    isSelected: boolean
}

export const Tab = (props: ITabProps) => {
    const className = props.isSelected ? "tab selected" : "tab not-selected"
    return <div className={className}>
        <div className="name">{props.name}</div>
    </div>
}

const mapStateToProps = (state: State.IState): State.ITabState => {
    return state.tabState
}

export const TabsContainer = connect(mapStateToProps)(Tabs)
