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

export enum OpenDirection {
    Up = 1,
    Down = 2,
}

export interface ICursorPositionerProps {
    beakColor?: string
    openDirection?: OpenDirection
    hideArrow?: boolean
}

export interface ICursorPositionerViewProps extends ICursorPositionerProps {
    x: number
    y: number
    lineHeight: number

    containerWidth: number
    containerHeight: number

    fontPixelWidth: number

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
        const adjustedY = this.state.shouldOpenDownward ? this.props.y + this.props.lineHeight * 2.5 : this.props.y

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
            left: (this.props.x + this.props.fontPixelWidth / 2).toString() + "px",
            visibility: this.props.hideArrow ? "hidden" : "visible",
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
                <Arrow direction={this.state.shouldOpenDownward ? ArrowDirection.Up : ArrowDirection.Down} size={5} color={this.props.beakColor} />
            </div>
        </div>
    }

    private _measureElement(element: HTMLElement): void {
        if (element) {
            const rect = element.getBoundingClientRect()

            const margin = this.props.lineHeight * 2
            const canOpenUpward = this.props.y - rect.height > margin
            const bottomScreenPadding = 50
            const canOpenDownard = this.props.y + rect.height + this.props.lineHeight * 3 < this.props.containerHeight - margin - bottomScreenPadding

            if (!this.state.isMeasured) {
                const shouldOpenDownward = (this.props.openDirection !== OpenDirection.Down && !canOpenUpward) || (this.props.openDirection === OpenDirection.Down && canOpenDownard)

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

const mapStateToProps = (state: IState, props?: ICursorPositionerProps): ICursorPositionerViewProps => {

    const x = state.cursorPixelX - (state.fontPixelWidth / 2) - 2
    const y = state.cursorPixelY - (state.fontPixelHeight * 1)
    const lineHeight = state.fontPixelHeight

    const beakColor = (props && props.beakColor) ? props.beakColor : state.backgroundColor

    return {
        beakColor,
        fontPixelWidth: state.fontPixelWidth,
        x,
        y,
        containerWidth: state.viewport.width,
        containerHeight: state.viewport.height,
        lineHeight,
        backgroundColor: state.backgroundColor,
    }
}

export const CursorPositioner = connect(mapStateToProps)(CursorPositionerView)
