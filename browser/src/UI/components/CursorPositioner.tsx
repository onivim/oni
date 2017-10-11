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

// const getOpenPosition = (state: IState): ICursorPositionerViewProps => {
//     // const openFromTopPosition = state.cursorPixelY + (state.fontPixelHeight * 2)
//     // const openFromBottomPosition = state.cursorPixelY - state.fontPixelHeight

//     // const openFromTop = state.cursorPixelY < 75

//     const x = state.cursorPixelX - (state.fontPixelWidth / 2) - 2
//     const y = state.cursorPixelY + state.fontPixelHeight * 2
//     const lineHeight = state.fontPixelHeight

//     return {
//         x,
//         y,
//         lineHeight,
//         backgroundColor: state.backgroundColor,
//     }
// }

export interface ICursorPositionerViewProps {
    x: number
    y: number
    lineHeight: number

    containerWidth: number
    containerHeight: number

    backgroundColor: string
}

export interface ICursorPositionerViewState {
    measuredRect: ClientRect | null
}

/**
 * Helper component to position an element relative to the current cursor position
 */
export class CursorPositionerView extends React.PureComponent<ICursorPositionerViewProps, ICursorPositionerViewState> {

    constructor(props: ICursorPositionerViewProps) {
        super(props)

        this.state = {
            measuredRect: null
        }
    }

    private _measureElement(element: HTMLElement): void {
        if (element) {
            const rect = element.getBoundingClientRect()

            if (!this.state.measuredRect
                || this.state.measuredRect.width !== rect.width
                || this.state.measuredRect.height !== rect.height) {

                this.setState({
                    measuredRect: rect
                })
            }
        }
    }

    public render(): JSX.Element {
        // Decide if should open from the top...
        let shouldOpenDownward = false
        let adjustedY = this.props.y
        let adjustedX = 0

        if (this.state.measuredRect) {
            if (this.props.y - this.state.measuredRect.height < this.props.lineHeight * 2) {
                shouldOpenDownward = true
                adjustedY = this.props.y + this.props.lineHeight * 3
            }

            if (this.state.measuredRect.right > this.props.containerWidth) {
                const offset = this.state.measuredRect.right - this.props.containerWidth

                adjustedX = -(offset + this.props.lineHeight)
            }


        }

        const containerStyle: React.CSSProperties = {
            position: "absolute",
            top: adjustedY.toString() + "px",
            left: this.props.x.toString() + "px",
            visibility: this.state.measuredRect === null ? "hidden" : "visible", // Wait until we've measured the bounds to show..
        }

        const openFromBottomStyle: React.CSSProperties = {
            position: "absolute",
            bottom: "0px",
        }

        const openFromTopStyle: React.CSSProperties = {
            position: "absolute",
            top: "0px",
        }

        const childStyle = shouldOpenDownward ? openFromTopStyle : openFromBottomStyle
        const arrowStyle = shouldOpenDownward ? openFromBottomStyle : openFromTopStyle

        const childStyleWithAdjustments= {
            ...childStyle,
            left: adjustedX.toString() + "px",
        }

        return <div style={containerStyle}>
                <div style={childStyleWithAdjustments}>
                    <div ref={(elem) => this._measureElement(elem) }>
                        {this.props.children}
                    </div>
                 </div>
                 <div style={arrowStyle}>
                     <Arrow direction={shouldOpenDownward ? ArrowDirection.Up : ArrowDirection.Down} size={10} color={this.props.backgroundColor} />
                 </div>
                </div>
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
