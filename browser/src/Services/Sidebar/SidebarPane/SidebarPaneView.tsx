import * as React from "react"
import { connect } from "react-redux"

import * as SidebarPaneStore from "./SidebarPaneStore"

export interface ISidebarPaneViewProps {
    selectedId: string
    widgets: SidebarPaneStore.ISidebarWidget[]
}

export class SidebarPaneView extends React.PureComponent<ISidebarPaneViewProps, {}> {
    public render(): JSX.Element[] {
        const context: SidebarPaneStore.IWidgetRenderContext = {
            selectedId: this.props.selectedId,
        }

        return this.props.widgets.map((w, i) => {
            return <div key={i}>{w.render(context)}</div>
        })
    }
}

const mapStateToProps = (state: SidebarPaneStore.ISidebarPaneState): ISidebarPaneViewProps => {
    return state
}

export const SidebarPaneContainer = connect(mapStateToProps)(SidebarPaneView)
