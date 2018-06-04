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
import styled, { pixel, withProps } from "./common"

export enum OpenDirection {
    Up = 1,
    Down = 2,
}

export interface ICursorPositionerProps {
    position?: Oni.Coordinates.PixelSpacePoint
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

interface ContainerProps {
    adjustedY: number
    containerWidth: number
    isMeasured: boolean
}

interface ArrowContainerProps {
    x: number
    fontPixelWidth: number
    hideArrow: boolean
    shouldOpenDownwards: boolean
}
interface ChildProps {
    adjustedX: number
    isFullWidth: boolean
    shouldOpenDownwards: boolean
}

const PositionerContainer = withProps<ContainerProps>(styled.div).attrs({
    style: ({ adjustedY, containerWidth, isMeasured }: ContainerProps) => ({
        top: pixel(adjustedY),
        width: pixel(containerWidth),
        visibility: isMeasured ? "visible" : "hidden", // Wait until we've measured the bounds to show..
    }),
})`
    position: absolute;
    left: 0px;
    max-width: 45vw;
`

const openFromBottomStyle = { bottom: "0px" }
const openFromTopStyle = { top: "0px" }

const PositionerChild = withProps<ChildProps>(styled.div).attrs({
    style: (props: ChildProps) => ({
        ...(props.shouldOpenDownwards ? openFromTopStyle : openFromBottomStyle),
        left: props.isFullWidth ? "8px" : pixel(Math.abs(props.adjustedX)),
        right: props.isFullWidth ? "8px" : null,
    }),
})`
    position: absolute;
    width: fit-content;
`

const ArrowContainer = withProps<ArrowContainerProps>(styled.div).attrs({
    style: (props: ArrowContainerProps) => ({
        ...(props.shouldOpenDownwards ? openFromBottomStyle : openFromTopStyle),
        left: pixel(props.x + props.fontPixelWidth / 2),
        visibility: props.hideArrow ? "hidden" : "visible",
    }),
})`
        position: absolute;
        width: fit-content;
`

export interface ICursorPositionerViewState {
    isMeasured: boolean
    isFullWidth: boolean
    shouldOpenDownward: boolean
    adjustedX: number
    adjustedY: number
    lastMeasuredX: number
    lastMeasuredY: number
    lastMeasuredHeight: number
    lastMeasuredWidth: number
}

/**
 * Helper component to position an element relative to the current cursor position
 */
export class CursorPositionerView extends React.PureComponent<
    ICursorPositionerViewProps,
    ICursorPositionerViewState
> {
    public state = {
        isMeasured: false,
        isFullWidth: false,
        shouldOpenDownward: false,
        adjustedX: 0,
        adjustedY: 0,
        lastMeasuredX: -1,
        lastMeasuredY: -1,
        lastMeasuredHeight: 0,
        lastMeasuredWidth: 0,
    }

    private _element: HTMLElement
    private _resizeObserver: any

    public componentDidMount(): void {
        if (this._element) {
            this._measureElement(this._element)

            // tslint:disable-next-line
            this._resizeObserver = new window["ResizeObserver"]((entries: any) => {
                if (!entries || !entries.length) {
                    return
                }

                const rect: ClientRect = entries[0].contentRect

                if (
                    rect.width <= this.state.lastMeasuredWidth &&
                    rect.height <= this.state.lastMeasuredHeight
                ) {
                    return
                }

                this._measureElement(this._element)
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
        const adjustedY = this.state.shouldOpenDownward
            ? this.props.y + this.props.lineHeight * 2.5
            : this.props.y

        const arrowDirection = this.state.shouldOpenDownward
            ? ArrowDirection.Up
            : ArrowDirection.Down

        return (
            <PositionerContainer
                isMeasured={this.state.isMeasured}
                containerWidth={this.props.containerWidth}
                adjustedY={adjustedY}
                key={this.props.key}
            >
                <PositionerChild
                    isFullWidth={this.state.isFullWidth}
                    adjustedX={this.state.adjustedX}
                    shouldOpenDownwards={this.state.shouldOpenDownward}
                >
                    <div ref={elem => (this._element = elem)}>{this.props.children}</div>
                </PositionerChild>
                <ArrowContainer
                    x={this.props.x}
                    hideArrow={this.props.hideArrow}
                    fontPixelWidth={this.props.fontPixelWidth}
                    shouldOpenDownwards={this.state.shouldOpenDownward}
                >
                    <Arrow size={10} color={this.props.beakColor} direction={arrowDirection} />
                </ArrowContainer>
            </PositionerContainer>
        )
    }

    private _measureElement(element: HTMLElement): void {
        if (element) {
            const rect = element.getBoundingClientRect()

            if (
                rect.left === this.state.lastMeasuredX &&
                rect.top === this.state.lastMeasuredY &&
                rect.height <= this.state.lastMeasuredHeight &&
                rect.width <= this.state.lastMeasuredWidth
            ) {
                return
            }

            const margin = this.props.lineHeight * 2
            const canOpenUpward = this.props.y - rect.height > margin
            const bottomScreenPadding = 50
            const canOpenDownwards =
                this.props.y + rect.height + this.props.lineHeight * 3 <
                this.props.containerHeight - margin - bottomScreenPadding

            const shouldOpenDownward =
                (this.props.openDirection !== OpenDirection.Down && !canOpenUpward) ||
                (this.props.openDirection === OpenDirection.Down && canOpenDownwards)

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

const mapStateToProps = (
    state: IState,
    props?: ICursorPositionerProps,
): ICursorPositionerViewProps => {
    const x = props.position ? props.position.pixelX : state.cursorPixelX
    const y = props.position ? props.position.pixelY : state.cursorPixelY

    const lineHeight = state.fontPixelHeight

    const backgroundColor = state.colors["editor.background"]

    const beakColor = props && props.beakColor ? props.beakColor : backgroundColor

    return {
        beakColor,
        fontPixelWidth: state.fontPixelWidth,
        x: x - state.fontPixelWidth / 2,
        y: y - state.fontPixelHeight,
        containerWidth: state.viewport.width,
        containerHeight: state.viewport.height,
        lineHeight,
        backgroundColor,
    }
}

export const CursorPositioner = connect(mapStateToProps)(CursorPositionerView)
