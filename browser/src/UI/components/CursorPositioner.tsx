/**
 * CursorPositioner.tsx
 *
 * Helper component to position items around the cursor.
 * Measures the rendered element and adjusts positioning as needed.
 */

import * as React from "react"
import { connect } from "react-redux"

import * as Oni from "oni-api"

import { IState } from "./../State"

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
    horizontalPosition: HorizontalPositionerResult
    verticalPosition: VerticalPositionerResult
}

const InitialState: ICursorPositionerViewState = {
    horizontalPosition: null,
    verticalPosition: null,
}

export interface HorizontalPositionerResult {
    x: number
    width: number
}

// Helper function to get the width + position of an element
export const getHorizontalPosition = (containerWidth: number, elementWidth: number, startPosition: number, padding: number = 0): HorizontalPositionerResult => {

    let x = Math.max(startPosition, padding)
    let width = elementWidth

    const containerWidthIncludingPadding = containerWidth - (padding * 2)

    if (x + width >= containerWidthIncludingPadding) {
        width = Math.min(containerWidthIncludingPadding, elementWidth)

        const xMargin = (x + width - containerWidthIncludingPadding - padding)
        x -= xMargin
    }

    return {
        x,
        width,
    }
}

export interface VerticalPositionerResult {
    y: number
    height: number
    openDirection: OpenDirection
}

// Helper function to get the open direction (whether the element should open upwards or downwards), along with a y-position and a clamped height
export const getVerticalPosition = (preferredOpenDirection: OpenDirection, containerHeight: number, elementHeight: number, startY: number, padding: number = 0): VerticalPositionerResult => {
    const canOpenUpward = (startY - elementHeight) > padding

    const bottomScreenPadding = 50
    const canOpenDownward = (startY + elementHeight + padding) < containerHeight - bottomScreenPadding

    const shouldOpenDownward = (preferredOpenDirection !== OpenDirection.Down && !canOpenUpward) || (preferredOpenDirection === OpenDirection.Down && canOpenDownward)

    const y = startY
    let height = elementHeight

    if (shouldOpenDownward) { // tslint:disable-line
        height = Math.min(elementHeight, containerHeight - y)
    } else {
        height = Math.min(y, elementHeight)
    }

    return {
        y,
        height,
        openDirection: shouldOpenDownward ? OpenDirection.Down : OpenDirection.Up,
    }
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

    public componentWillReceiveProps(nextProps: ICursorPositionerViewProps): void {
        if (nextProps.containerWidth !== this.props.containerWidth
            || nextProps.containerHeight !== this.props.containerHeight) {
            this.setState({
                horizontalPosition: null,
                verticalPosition: null,
            })
        }
    }

    public componentDidMount(): void {
        if (this._element) {
            this._measureElement(this._element)

            this._resizeObserver = new window["ResizeObserver"]((entries: any) => { // tslint:disable-line

                if (!entries || !entries.length) {
                    return
                }

                if (this.state.horizontalPosition && this.state.verticalPosition) {
                    return
                }

                this._scheduleMeasure()
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

    public componentWillUpdate(): void {
        this._scheduleMeasure()
    }

    public render(): JSX.Element {
        const adjustedX = this.state.horizontalPosition ? this.state.horizontalPosition.x : this.props.x
        const adjustedY = this.state.verticalPosition ? this.state.verticalPosition.y : this.props.y
        const yOffset = (this.state.verticalPosition && this.state.verticalPosition.openDirection === OpenDirection.Down) ? this.props.lineHeight * 2.5 : 0

        const isMeasured = this.state.horizontalPosition && this.state.verticalPosition

        const containerStyle: React.CSSProperties = {
            position: "absolute",
            top: (adjustedY + yOffset).toString() + "px",
            left: "0px",
            width: this.props.containerWidth.toString() + "px",
            visibility: isMeasured ? "visible" : "hidden", // Wait until we've measured the bounds to show..
        }

        const openFromBottomStyle: React.CSSProperties = {
            position: "absolute",
            bottom: "0px",
        }

        const openFromTopStyle: React.CSSProperties = {
            position: "absolute",
            top: "0px",
        }

        const openDirection: OpenDirection = this.state.verticalPosition ? this.state.verticalPosition.openDirection : this.props.openDirection
        const shouldOpenDownward = openDirection === OpenDirection.Down

        const childStyle = shouldOpenDownward ? openFromTopStyle : openFromBottomStyle
        const arrowStyle = shouldOpenDownward ? openFromBottomStyle : openFromTopStyle

        const arrowStyleWithAdjustments = {
            ...arrowStyle,
            left: (this.props.x + this.props.fontPixelWidth / 2).toString() + "px",
            visibility: this.props.hideArrow ? "hidden" : "visible",
        }

        const childStyleWithAdjustments: React.CSSProperties = isMeasured ? {
            ...childStyle,
            left: adjustedX.toString() + "px",
            width: this.state.horizontalPosition.width.toString() + "px",
        } : childStyle

        return <div style={containerStyle} key={this.props.key}>
            <div style={childStyleWithAdjustments}>
                <div ref={(elem) => this._element = elem}>
                    {this.props.children}
                </div>
            </div>
            <div style={arrowStyleWithAdjustments}>
                <Arrow direction={shouldOpenDownward ? ArrowDirection.Up : ArrowDirection.Down} size={5} color={this.props.beakColor} />
            </div>
        </div>
    }

    private _scheduleMeasure(): void {
        if (this._timeout) {
            window.clearTimeout(this._timeout)
        }

        this._timeout = window.setTimeout(() => {
            this._measureElement(this._element)
            this._timeout = null
        }, 50)
    }

    private _measureElement(element: HTMLElement): void {
        if (element) {
            const rect = element.getBoundingClientRect()

            if (!this.state.horizontalPosition) {
                const horizontalPosition = getHorizontalPosition(this.props.containerWidth, rect.width, this.props.x, 8)
                this.setState({
                    horizontalPosition,
                })

                return
            }

            if (!this.state.verticalPosition) {
                const verticalPosition = getVerticalPosition(this.props.openDirection, this.props.containerHeight, rect.height, this.props.y, 8)

                this.setState({
                    verticalPosition,
                })

                return
            }
        }
    }
}

const mapStateToProps = (state: IState, props?: ICursorPositionerProps): ICursorPositionerViewProps => {
    const x = props.position ? props.position.pixelX : state.cursorPixelX
    const y = props.position ? props.position.pixelY : state.cursorPixelY

    const lineHeight = state.fontPixelHeight

    const beakColor = (props && props.beakColor) ? props.beakColor : state.backgroundColor

    return {
        beakColor,
        fontPixelWidth: state.fontPixelWidth,
        x: x - (state.fontPixelWidth / 2),
        y: y - (state.fontPixelHeight),
        containerWidth: state.viewport.width,
        containerHeight: state.viewport.height,
        lineHeight,
        backgroundColor: state.backgroundColor,
    }
}

export const CursorPositioner = connect(mapStateToProps)(CursorPositionerView)
