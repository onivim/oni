/**
 * Tabs.tsx
 */

import * as path from "path"

import * as React from "react"
import { connect } from "react-redux"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

import { Icon } from "./../Icon"

require("./Tabs.less") // tslint:disable-line no-var-requires

export interface ITabProps {
    id: string
    name: string
    isSelected: boolean
}

export interface ITabsProps {
    tabs: ITabProps[]
}

export class Tabs extends React.PureComponent<ITabsProps, void> {
    public render(): JSX.Element {

        const tabBorderStyle = {
            "borderBottom": "4px solid rgb(40, 44, 52)",
        }

        const tabs = this.props.tabs.map((t) => {
            // const isSelected = t.id === this.props.selectedTabId
            // const normalizedName = path.basename(t.name)

            return <Tab {...t}/>
        })

        return <div className="tabs horizontal enable-mouse" style={tabBorderStyle}>
            {tabs}
        </div>
    }
}

export const Tab = (props: ITabProps) => {
    const className = props.isSelected ? "tab selected" : "tab not-selected"
    return <div className={className}>
        <div className="name">{props.name}</div>
        <div className="corner">
            <div className="close">
                <Icon name="times" />
            </div>
            <div className="dirty">
                <div className="circle" />
            </div>
        </div>
    </div>
}

const mapStateToProps = (state: State.IState): ITabsProps => {
    const buffers = Selectors.getAllBuffers(state)

    const tabs = buffers.map((buf) => ({
        id: "",
        name: path.basename(buf.file),
        isSelected: true,
    }))

    return {
        tabs,
    }
    // return state.tabState
}

export const TabsContainer = connect(mapStateToProps)(Tabs)
