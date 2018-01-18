import * as React from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { boxShadow, withProps, darken } from "./common"

import { createSelector } from "reselect"

import * as State from "./../../Editor/NeovimEditor/NeovimEditorStore"

import { CursorPositioner } from "./CursorPositioner"

interface IToolTipProps {
    padding: string
    fontFamily: string
}

// TODO: reduce degree of darkening based on light or dark bg
const ToolTipContainer = withProps<IToolTipProps>(styled.div)`
    border: ${p => `1px solid ${p.theme["toolTip.border"]}`};
    background-color: ${p => darken(p.theme["toolTip.background"])};
    color: ${p => p.theme["toolTip.foreground"]};
    padding: ${p => p.padding};
    height: auto;
    font-family: ${p => p.fontFamily};
    ${boxShadow};

    * {
        font-family: ${p => p.fontFamily};
    }
`

export interface IToolTipsViewProps {
    toolTips: State.IToolTip[]
    fontFamily: string
    fontSize: string
}

export class ToolTipsView extends React.PureComponent<IToolTipsViewProps, {}> {
    public render(): JSX.Element {
        const toolTipElements = this.props.toolTips.map(toolTip => {
            return (
                <ToolTipView fontFamily={this.props.fontFamily} {...toolTip} key={toolTip.id} />
            )
        })

        const style: React.CSSProperties = {
            fontFamily: this.props.fontFamily,
            fontSize: this.props.fontSize,
        }

        return (
            <div className="tool-tips" style={style}>
                {toolTipElements}
            </div>
        )
    }
}

export interface IToolTipViewProps extends State.IToolTip {
    fontFamily: string
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
        const { options, fontFamily } =  this.props
        const { position = null, openDirection = 1, padding = "8px" } = options

        return (
            <CursorPositioner position={position} openDirection={openDirection}>
                <ToolTipContainer
                    padding={padding}
                    fontFamily={fontFamily}
                    innerRef={(elem: any) => this._setContainer(elem)}
                    >
                    {this.props.element}
                </ToolTipContainer>
            </CursorPositioner>
        )
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

const getToolTipsSelector = createSelector([getToolTips], toolTips => {
    return Object.keys(toolTips)
        .map(toolTipId => toolTips[toolTipId])
        .filter(toolTipState => toolTipState !== null)
})

const mapStateToProps = (state: State.IState): IToolTipsViewProps => {
    const toolTips = getToolTipsSelector(state)

    return {
        fontFamily: state.fontFamily,
        fontSize: state.fontSize,
        toolTips,
    }
}

export const ToolTips = connect(mapStateToProps)(ToolTipsView)
