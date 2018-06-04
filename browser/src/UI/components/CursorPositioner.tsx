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

const InitialState = {
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

interface ContainerProps {
    adjustedY: number
    containerWidth: number
    isMeasured: boolean
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

interface ChildProps {
    adjustedX: number
    isFullWidth: boolean
    shouldOpenDownwards: boolean
}

const openFromBottomStyle = { bottom: "0px" }
const openFromTopStyle = { top: "0px" }

const PositionerChild = withProps<ChildProps>(styled.div).attrs({
    style: (props: ChildProps) => ({
        left: props.isFullWidth ? "8px" : pixel(Math.abs(props.adjustedX)),
        right: props.isFullWidth ? "8px" : null,
        ...(props.shouldOpenDownwards ? openFromBottomStyle : openFromTopStyle),
    }),
})`
    position: absolute;
    width: fit-content;
`

interface ArrowContainerProps {
    x: number
    fontPixelWidth: number
    hideArrow: boolean
    shouldOpenDownwards: boolean
}

const ArrowContainer = withProps<ArrowContainerProps>(styled.div).attrs({
    style: (props: ArrowContainerProps) => ({
        left: pixel(props.x + props.fontPixelWidth / 2),
        visibility: props.hideArrow ? "hidden" : "visible",
        ...(props.shouldOpenDownwards ? openFromTopStyle : openFromBottomStyle),
    }),
})``

/**
 * Helper component to position an element relative to the current cursor position
 */
export class CursorPositionerView extends React.PureComponent<
    ICursorPositionerViewProps,
    ICursorPositionerViewState
> {
    public static getDerivedStateFromProps(
        nextProps: ICursorPositionerViewProps,
        prevState: ICursorPositionerViewState,
    ) {
        const adjustedY = prevState.shouldOpenDownward
            ? nextProps.y + nextProps.lineHeight * 2.5
            : nextProps.y
        return { ...prevState, adjustedY }
    }

    public state = InitialState

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
        // const adjustedX = this.state.adjustedX
        // const adjustedY = this.state.shouldOpenDownward
        //     ? this.props.y + this.props.lineHeight * 2.5
        //     : this.props.y

        // const containerStyle: React.CSSProperties = {
        //     position: "absolute",
        //     top: adjustedY.toString() + "px",
        //     left: "0px",
        //     width: this.props.containerWidth.toString() + "px",
        //     maxWidth: "45vw",
        //     visibility: this.state.isMeasured ? "visible" : "hidden", // Wait until we've measured the bounds to show..
        // }

        // const openFromBottomStyle: React.CSSProperties = {
        //     position: "absolute",
        //     bottom: "0px",
        //     width: "fit-content",
        // }
        //
        // const openFromTopStyle: React.CSSProperties = {
        //     position: "absolute",
        //     top: "0px",
        //     width: "fit-content",
        // }

        // const childStyle = this.state.shouldOpenDownward ? openFromTopStyle : openFromBottomStyle
        // const arrowStyle = this.state.shouldOpenDownward ? openFromBottomStyle : openFromTopStyle

        // const arrowStyleWithAdjustments: React.CSSProperties = {
        //     ...arrowStyle,
        //     left: (this.props.x + this.props.fontPixelWidth / 2).toString() + "px",
        //     visibility: this.props.hideArrow ? "hidden" : "visible",
        // }

        // const childStyleWithAdjustments: React.CSSProperties = this.state.isMeasured
        //     ? {
        //           ...childStyle,
        //           left: this.state.isFullWidth ? "8px" : Math.abs(adjustedX).toString() + "px",
        //           right: this.state.isFullWidth ? "8px" : null,
        //       }
        //     : childStyle

        const {
            x,
            key,
            hideArrow,
            children,
            beakColor,
            containerWidth,
            fontPixelWidth,
        } = this.props

        const { isMeasured, isFullWidth, shouldOpenDownward } = this.state

        return (
            <PositionerContainer
                isMeasured={isMeasured}
                containerWidth={containerWidth}
                adjustedY={this.state.adjustedY}
                key={key}
            >
                <PositionerChild
                    isFullWidth={isFullWidth}
                    adjustedX={this.state.adjustedX}
                    shouldOpenDownwards={shouldOpenDownward}
                >
                    <div ref={elem => (this._element = elem)}>{children}</div>
                </PositionerChild>
                <ArrowContainer
                    x={x}
                    hideArrow={hideArrow}
                    fontPixelWidth={fontPixelWidth}
                    shouldOpenDownwards={shouldOpenDownward}
                >
                    <Arrow
                        size={10}
                        color={beakColor}
                        direction={shouldOpenDownward ? ArrowDirection.Up : ArrowDirection.Down}
                    />
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
            const canOpenDownard =
                this.props.y + rect.height + this.props.lineHeight * 3 <
                this.props.containerHeight - margin - bottomScreenPadding

            const shouldOpenDownward =
                (this.props.openDirection !== OpenDirection.Down && !canOpenUpward) ||
                (this.props.openDirection === OpenDirection.Down && canOpenDownard)

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
