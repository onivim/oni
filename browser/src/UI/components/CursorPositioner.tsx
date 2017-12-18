/**
 * CursorPositioner.tsx
 *
 * Helper component to position items around the cursor.
 * Measures the rendered element and adjusts positioning as needed.
 */

import * as React from "react"
import { connect } from "react-redux"

import * as Oni from "oni-api"

import styled from "styled-components"
import { withProps } from "./common"

import { IState } from "./../State"

import { Arrow, ArrowDirection } from "./Arrow"

export enum OpenDirection {
    Up = 1,
    Down = 2,
}

/**
 * Helper function that fixes an item horizontally to its first positioned parent.
 */
function vfix(top: boolean = true) {
    return top
        ? `
      position: absolute;
      top: 0;
      `
        : `
      position: absolute;
      bottom: 0;
      `
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

    isFullWidth: boolean
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

interface OuterProps extends React.Props<HTMLDivElement> {
    children: React.ReactNode
    y: number
    width: number
    visible: boolean
}

const Outer = withProps<OuterProps, HTMLDivElement>(styled.div) `
    position: absolute;
    top: ${props => props.y}px;
    left: 0px;
    width: ${props => props.width}px;
    visibility: ${props => props.visible ? "visible" : "hidden"}; /* For waiting until we've measured the bounds to show. */
    `
interface ArrowContainerProps extends React.Props<HTMLDivElement> {
    shouldOpenDownward: boolean
    x: number
    visible: boolean
}

const ArrowContainer = withProps<ArrowContainerProps, HTMLDivElement>(styled.div)`
     ${props => vfix(!props.shouldOpenDownward)}
     left: ${props => props.x}px;
     visibility: ${props => props.visible ? "visible" : "hidden"};
`

interface InnerProps extends React.Props<HTMLDivElement> {
    shouldOpenDownward: boolean
    isMeasured: boolean
    isFullWidth: boolean
    adjustedX: number
}

const Inner = withProps<InnerProps, HTMLDivElement>(styled.div) `
    ${props => vfix(props.shouldOpenDownward)}
    ${props => props.isMeasured
        ? `
        left: ${props.isFullWidth ? "8px" : Math.abs(props.adjustedX) + "px"};
        right: ${props.isFullWidth ? "8px" : ""};
        max-width: 95%;
        `
        : ``}
    `

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

        return <Outer
            key={this.props.key}
            y={adjustedY}
            width={this.props.containerWidth}
            visible={this.state.isMeasured}>
            <Inner
                innerRef={(elem: HTMLElement) => this._element = elem}
                key={this.props.key}
                adjustedX={adjustedX}
                isMeasured={this.state.isMeasured}
                isFullWidth={this.state.isFullWidth}
                shouldOpenDownward={this.state.shouldOpenDownward}
            >
                {this.props.children}
            </Inner>
            <ArrowContainer
                x={this.props.x + this.props.fontPixelWidth / 2}
                shouldOpenDownward={this.state.shouldOpenDownward}
                visible={this.state.isMeasured}
            >
                <Arrow
                direction={this.state.shouldOpenDownward
                    ? ArrowDirection.Up
                    : ArrowDirection.Down}
                size={5}
                color={this.props.beakColor}
                />
            </ArrowContainer>
        </Outer>
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
