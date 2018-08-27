import * as React from "react"

import * as uniqBy from "lodash/uniqBy"
import styled from "styled-components"
import { bufferScrollBarSize, pixel, withProps } from "./common"

import { editorManager } from "./../../Services/EditorManager"

export interface IBufferScrollBarProps {
    windowId: number
    bufferSize: number
    height: number
    windowTopLine: number
    windowBottomLine: number
    markers: IScrollBarMarker[]
    visible: boolean
}

export interface IBufferScrollBarState {
    scrollBarTop: number
}

export interface IScrollBarMarker {
    line: number
    height: number
    color: string
}

const ScrollBarContainer = withProps<Partial<IScrollBarWindow>>(styled.div).attrs({
    style: ({ height }: Partial<IScrollBarWindow>) => ({
        height: pixel(height),
    }),
})`
    position: fixed;
    top: 0px;
    bottom: 0px;
    right: 0px;
    background-color: rgba(0, 0, 0, 0.2);
    width: ${bufferScrollBarSize};
    border-bottom: 1px solid black;
    pointer-events: auto;
`
interface IScrollBarWindow {
    height: number
    top: number
}

const ScrollBarWindow = withProps<IScrollBarWindow>(styled.div).attrs({
    style: ({ top, height }: IScrollBarWindow) => ({
        top: pixel(top),
        height: pixel(height),
    }),
})`
    position: absolute;
    width: ${bufferScrollBarSize};
    background-color: rgba(200, 200, 200, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    pointer-events: none;
`
interface IMarkerElement {
    height: string
    top: number
    color: string
}

export const MarkerElement = withProps<IMarkerElement>(styled.div).attrs({
    style: ({ height, top }: IMarkerElement) => ({
        top: pixel(top),
        height,
    }),
})`
        background-color: ${p => p.color};
        width: 100%;
        position: absolute;
        pointer-events: none;
`

export class BufferScrollBar extends React.PureComponent<
    IBufferScrollBarProps,
    IBufferScrollBarState
> {
    public static defaultProps: Partial<IBufferScrollBarProps> = {
        markers: [],
    }

    public state: IBufferScrollBarState = {
        scrollBarTop: 0,
    }

    public setLine = (y: number) => {
        const lineFraction = Math.min(
            Math.max((y - this.state.scrollBarTop) / this.props.height, 0),
            1,
        )
        const newLine = Math.ceil(editorManager.activeEditor.activeBuffer.lineCount * lineFraction)
        editorManager.activeEditor.activeBuffer.setCursorPosition(newLine, 0)
    }

    public beginScroll = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        // offsetY is definitely on the scrollbar in the beginning of the click
        this.setState({ scrollBarTop: e.nativeEvent.clientY - e.nativeEvent.offsetY })
        this.setLine(e.nativeEvent.clientY)
        document.addEventListener("mousemove", this.trackScroll, true)
        document.addEventListener("mouseup", this.endScroll, true)
    }

    public trackScroll = (e: MouseEvent) => {
        e.preventDefault()
        this.setLine(e.clientY)
    }

    public endScroll = (e: MouseEvent) => {
        e.preventDefault()
        this.setLine(e.clientY)
        document.removeEventListener("mousemove", this.trackScroll, true)
        document.removeEventListener("mouseup", this.endScroll, true)
    }

    public calculateWindowDimensions() {
        const { windowBottomLine, windowTopLine, bufferSize, height } = this.props
        const windowHeight = (windowBottomLine - windowTopLine + 1) / bufferSize * height
        const windowTop = (windowTopLine - 1) / bufferSize * height
        return { windowHeight, windowTop }
    }

    public renderMarkers() {
        // Only show one marker per line in the scroll bar
        const uniqueMarkers = uniqBy(this.props.markers, ({ line }) => line)
        const markerElements = uniqueMarkers.map(({ line, color }) => {
            const pos = line / this.props.bufferSize * this.props.height
            const size = "2px"

            return (
                <MarkerElement
                    top={pos}
                    height={size}
                    color={color}
                    id="scrollbar-marker-element"
                    key={`${this.props.windowId}_${color}_${line}`}
                />
            )
        })
        return markerElements
    }

    public render() {
        if (!this.props.visible) {
            return null
        }

        const markerElements = this.renderMarkers()
        const { windowHeight, windowTop } = this.calculateWindowDimensions()

        return (
            <ScrollBarContainer
                key={this.props.windowId}
                height={this.props.height}
                onMouseDown={this.beginScroll}
            >
                <ScrollBarWindow top={windowTop} height={windowHeight} />
                {markerElements}
            </ScrollBarContainer>
        )
    }
}
