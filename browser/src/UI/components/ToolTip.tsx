import * as React from "react"
import { connect } from "react-redux"

import * as State from "./../State"

import { CursorPositioner } from "./CursorPositioner"

export interface IToolTipsViewProps {
    toolTips: State.IToolTip[]
}

export class ToolTipsView extends React.PureComponent<IToolTipsViewProps, void> {

    public render(): JSX.Element {

        const toolTipElements = this.props.toolTips.map((toolTip) => <ToolTipView {...toolTip} />)

        return <div className="tool-tip-container">
                {toolTipElements}
            </div>
    }
}

export interface IToolTipViewProps extends State.IToolTip { }

export class ToolTipView extends React.PureComponent<IToolTipViewProps, void> {

    public render(): JSX.Element {

        const options = this.props.options
        const position = options.position || null
        const openDirection = options.openDirection || 1

        return <CursorPositioner position={position} openDirection={openDirection}>
                    <div>test</div>
                </CursorPositioner>
    }
}

const mapStateToProps = (state: State.IState): IToolTipsViewProps => {

    const toolTips = Object.keys(state.toolTips)
                        .map((toolTipId) => state.toolTips[toolTipId])


    return {
        toolTips,
    }
}

export const ToolTips = connect(mapStateToProps)(ToolTipsView)
