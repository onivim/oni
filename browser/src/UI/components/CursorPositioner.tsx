/**
 * CursorPositioner.tsx
 *
 * Helper component to position items around the cursor.
 * Measures the rendered element and adjusts positioning as needed.
 */

import * as React from "react"
import { connect } from "react-redux"

import * as Oni from "oni-api"

import { IState } from "./../../Editor/NeovimEditor/NeovimEditorStore"

import { Arrow, ArrowDirection } from "./Arrow"

export enum OpenDirection {
    Up = 1,
    Down = 2,
}

export interface ICursorPositionerProps {
    position?: Oni.Coordinates.PixelSpacePoint,
    beakColor?: string
    openDirection?: OpenDirection
    hideArrow?: boolean
    key?: string
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

    isFullWidth: boolean,
    shouldOpenDownward: boolean,
    adjustedX: number
    lastMeasuredX: number,
    lastMeasuredY: number,
    lastMeasuredHeight: number,
    lastMeasuredWidth: number,
}

const InitialState = {
    isMeasured: false,

    isFullWidth: false,
    shouldOpenDownward: false,
    adjustedX: 0,

    lastMeasuredX: -1,
    lastMeasuredY: -1,
    lastMeasuredHeight: 0,
    lastMeasuredWidth: 0,
}

/**
 * Helper component to position an element relative to the current cursor position
 */
export class CursorPositionerView extends React.PureComponent<ICursorPositionerViewProps, ICursorPositionerViewState> {

    private _element: HTMLElement
    private _resizeObserver: any
    private _timeout: any

    constructor(props: ICursorPositionerViewProps) {
        super(props)

        this.state = InitialState
    }

    public componentDidMount(): void {
        if (this._element) {
            this._measureElement(this._element)

            this._resizeObserver = new window["ResizeObserver"]((entries: any) => { // tslint:disable-line

                if (!entries || !entries.length) {
                    return
                }

                const rect: ClientRect = entries[0].contentRect

                if (rect.width <= this.state.lastMeasuredWidth && rect.height <= this.state.lastMeasuredHeight) {
                    return
                }

                if (this._timeout) {
                    window.clearTimeout(this._timeout)
                }

                this._timeout = window.setTimeout(() => {
                    this._measureElement(this._element)
                    this._timeout = null
                }, 50)
            })

            this._resizeObserver.observe(this._element)
        }
    }

    public componentWillUnmount(): void {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect()
            this._resizeObserver = null
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
            maxWidth: "55vw",
            maxHeight: "30vh",
            visibility: this.state.isMeasured ? "visible" : "hidden", // Wait until we've measured the bounds to show..
        }

        const openFromBottomStyle: React.CSSProperties = {
            position: "absolute",
            bottom: "0px",
            width: "fit-content",
        }

        const openFromTopStyle: React.CSSProperties = {
            position: "absolute",
            top: "0px",
            width: "fit-content",
        }

        const childStyle = this.state.shouldOpenDownward ? openFromTopStyle : openFromBottomStyle
        const arrowStyle = this.state.shouldOpenDownward ? openFromBottomStyle : openFromTopStyle

        const arrowStyleWithAdjustments = {
            ...arrowStyle,
            left: (this.props.x + this.props.fontPixelWidth / 2).toString() + "px",
            visibility: this.props.hideArrow ? "hidden" : "visible",
        }

        const childStyleWithAdjustments: React.CSSProperties = this.state.isMeasured ? {
            ...childStyle,
            left: this.state.isFullWidth ? "8px" : Math.abs(adjustedX).toString() + "px",
            right: this.state.isFullWidth ? "8px" : null,
        } : childStyle

        return <div style={containerStyle} key={this.props.key}>
            <div style={childStyleWithAdjustments}>
                <div ref={(elem) => this._element = elem}>
                    {this.props.children}
                </div>
            </div>
            <div style={arrowStyleWithAdjustments}>
                <Arrow
                    direction={this.state.shouldOpenDownward
                        ? ArrowDirection.Up
                        : ArrowDirection.Down}
                    size={5}
                    color={this.props.beakColor}
                />
            </div>
        </div>
    }

    private _measureElement(element: HTMLElement): void {
        if (element) {
            const rect = element.getBoundingClientRect()

            if (rect.left === this.state.lastMeasuredX
                && rect.top === this.state.lastMeasuredY
                && rect.height <= this.state.lastMeasuredHeight
               && rect.width <= this.state.lastMeasuredWidth) {
                return
            }

            const margin = this.props.lineHeight * 2
            const canOpenUpward = this.props.y - rect.height > margin
            const bottomScreenPadding = 50
            const canOpenDownard = this.props.y + rect.height + this.props.lineHeight * 3 < this.props.containerHeight - margin - bottomScreenPadding

            const shouldOpenDownward =
                (this.props.openDirection !== OpenDirection.Down && !canOpenUpward)
                || (this.props.openDirection === OpenDirection.Down && canOpenDownard)

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
                    lastMeasuredX: rect.left,
                    lastMeasuredY: rect.top,
                    lastMeasuredWidth: rect.width,
                    lastMeasuredHeight: rect.height,
                })
        }
    }
}

const mapStateToProps = (state: IState, props?: ICursorPositionerProps): ICursorPositionerViewProps => {
    const x = props.position ? props.position.pixelX : state.cursorPixelX
    const y = props.position ? props.position.pixelY : state.cursorPixelY

    const lineHeight = state.fontPixelHeight

    const backgroundColor = state.colors["editor.background"]

    const beakColor = (props && props.beakColor) ? props.beakColor : backgroundColor

    return {
        beakColor,
        fontPixelWidth: state.fontPixelWidth,
        x: x - (state.fontPixelWidth / 2),
        y: y - (state.fontPixelHeight),
        containerWidth: state.viewport.width,
        containerHeight: state.viewport.height,
        lineHeight,
        backgroundColor,
    }
}

export const CursorPositioner = connect(mapStateToProps)(CursorPositionerView)
