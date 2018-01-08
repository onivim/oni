import * as React from "react"
import { connect } from "react-redux"

import { createSelector } from "reselect"

import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

import { CursorPositioner } from "./CursorPositioner"

export interface IToolTipsViewProps {
    toolTips: State.IToolTip[]
    backgroundColor: string
    foregroundColor: string
    borderColor: string
    fontFamily: string
    fontSize: string
}

export class ToolTipsView extends React.PureComponent<IToolTipsViewProps, {}> {

    public render(): JSX.Element {
        const toolTipElements = this.props.toolTips.map((toolTip) => {
            return <ToolTipView {...toolTip} key={toolTip.id} borderColor={this.props.borderColor} foregroundColor={this.props.foregroundColor} backgroundColor={this.props.backgroundColor}/>
        })

        const style: React.CSSProperties = {
            fontFamily: this.props.fontFamily,
            fontSize: this.props.fontSize,
        }

        return <div className="tool-tips" style={style}>
            {toolTipElements}
        </div>
    }
}

export interface IToolTipViewProps extends State.IToolTip {
    backgroundColor: string
    foregroundColor: string
    borderColor: string
}

export class ToolTipView extends React.PureComponent<IToolTipViewProps, {}> {

    private _container: HTMLElement
    private _unmount: () => void

    constructor(props: IToolTipViewProps) {
        super(props)
    }

    public componentDidMount(): void {
        const func = (evt: MouseEvent) => this._checkIfClickIsOutside(evt)
        document.addEventListener("mousedown", func)

        this._unmount = () => document.removeEventListener("mousedown", func)
    }

    public componentWillUnmount(): void {
        if (this._unmount) {
            this._unmount()
            this._unmount = null
        }
    }

    public render(): JSX.Element {

        const options = this.props.options
        const position = options.position || null
        const openDirection = options.openDirection || 1
        const padding = options.padding || "8px"

        const toolTipStyle: React.CSSProperties = {
            backgroundColor: this.props.backgroundColor,
            border: `1px solid ${this.props.borderColor}`,
            color: this.props.foregroundColor,
            padding,
        }

        return <CursorPositioner position={position} openDirection={openDirection}>
                <div className="tool-tip-container enable-mouse" style={toolTipStyle} ref={(elem) => this._setContainer(elem)}>
                    {this.props.element}
                </div>
            </CursorPositioner>
    }

    private _setContainer(element: HTMLElement): void {
        this._container = element
    }

    private _checkIfClickIsOutside(evt: MouseEvent): void {

        if (this._container && !this._container.contains(evt.target as any)) {
            if (this.props.options.onDismiss) {
                this.props.options.onDismiss()
            }
        }
    }
}

const getToolTips = (state: State.IState) => state.toolTips

const getToolTipsSelector = createSelector(
    [getToolTips],
    (toolTips) => {
        return Object.keys(toolTips)
            .map((toolTipId) => toolTips[toolTipId])
            .filter((toolTipState) => toolTipState !== null)
    })

const mapStateToProps = (state: State.IState): IToolTipsViewProps => {

    const toolTips = getToolTipsSelector(state)

    return {
        borderColor: state.colors["toolTip.border"],
        backgroundColor: state.colors["toolTip.background"],
        foregroundColor: state.colors["toolTip.foreground"],
        fontFamily: state.fontFamily,
        fontSize: state.fontSize,
        toolTips,
    }
}

export const ToolTips = connect(mapStateToProps)(ToolTipsView)
