/**
 * CursorPositioner.tsx
 *
 * Helper component to position items around the cursor.
 * Measures the rendered element and adjusts positioning as needed.
 */

import * as React from "react"
import { connect } from "react-redux"

import { IState } from "./../State"

import { Arrow, ArrowDirection } from "./Arrow"

export interface ICursorPositionerViewProps {
    x: number
    y: number
    lineHeight: number

    containerWidth: number
    containerHeight: number

    backgroundColor: string
}

export interface ICursorPositionerViewState {
    isMeasured: boolean

    isFullWidth: boolean
    shouldOpenDownward: boolean,
    adjustedX: number
}

const InitialState = {
    isMeasured: false,

    isFullWidth: false,
    shouldOpenDownward: false,
    adjustedX: 0,
}

/**
 * Helper component to position an element relative to the current cursor position
 */
export class CursorPositionerView extends React.PureComponent<ICursorPositionerViewProps, ICursorPositionerViewState> {

    constructor(props: ICursorPositionerViewProps) {
        super(props)

        this.state = InitialState
    }

    public componentWillReceiveProps(nextProps: ICursorPositionerViewProps): void {
        if (this.props !== nextProps) {
            this.setState(InitialState)
        }
    }

    public render(): JSX.Element {
        const adjustedX = this.state.adjustedX
        const adjustedY = this.state.shouldOpenDownward ? this.props.y + this.props.lineHeight * 3 : this.props.y

        const containerStyle: React.CSSProperties = {
            position: "absolute",
            top: adjustedY.toString() + "px",
            left: "0px",
            width: this.props.containerWidth.toString() + "px",
            visibility: this.state.isMeasured ? "visible" : "hidden", // Wait until we've measured the bounds to show..
        }

        const openFromBottomStyle: React.CSSProperties = {
            position: "absolute",
            bottom: "0px",
        }

        const openFromTopStyle: React.CSSProperties = {
            position: "absolute",
            top: "0px",
        }

        const childStyle = this.state.shouldOpenDownward ? openFromTopStyle : openFromBottomStyle
        const arrowStyle = this.state.shouldOpenDownward ? openFromBottomStyle : openFromTopStyle

        const arrowStyleWithAdjustments = {
            ...arrowStyle,
            left: this.props.x.toString() + "px",
        }

        const childStyleWithAdjustments = this.state.isMeasured ? {
            ...childStyle,
            left: this.state.isFullWidth ? "8px" : adjustedX.toString() + "px",
            right: this.state.isFullWidth ? "8px" : null,
        } : childStyle

        return <div style={containerStyle}>
            <div style={childStyleWithAdjustments}>
                <div ref={(elem) => this._measureElement(elem)}>
                    {this.props.children}
                </div>
            </div>
            <div style={arrowStyleWithAdjustments}>
                <Arrow direction={this.state.shouldOpenDownward ? ArrowDirection.Up : ArrowDirection.Down} size={10} color={this.props.backgroundColor} />
            </div>
        </div>
    }

    private _measureElement(element: HTMLElement): void {
        if (element) {
            const rect = element.getBoundingClientRect()

            if (!this.state.isMeasured) {
                const shouldOpenDownward = this.props.y - rect.height < this.props.lineHeight * 2

                const rightBounds = this.props.x + rect.width

                const isFullWidth = rect.width > this.props.containerWidth

                let adjustedX = this.props.x

                if (!isFullWidth && rightBounds > this.props.containerWidth) {
                    const offset = rightBounds - this.props.containerWidth + 8
                    adjustedX = this.props.x - offset
                }

                this.setState({
                    isFullWidth,
                    shouldOpenDownward,
                    adjustedX,
                    isMeasured: true,
                })
            }
        }
    }
}

const mapStateToProps = (state: IState): ICursorPositionerViewProps => {

    const x = state.cursorPixelX - (state.fontPixelWidth / 2) - 2
    const y = state.cursorPixelY - (state.fontPixelHeight * 1)
    const lineHeight = state.fontPixelHeight

    return {
        x,
        y,
        containerWidth: state.viewport.width,
        containerHeight: state.viewport.height,
        lineHeight,
        backgroundColor: state.backgroundColor,
    }
}

export const CursorPositioner = connect(mapStateToProps)(CursorPositionerView)
