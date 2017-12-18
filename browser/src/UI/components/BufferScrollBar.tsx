import * as React from "react"

import styled from "styled-components"
import { bufferScrollBarSize, withProps } from "./common"

export interface IBufferScrollBarProps {
    bufferSize: number
    height: number
    windowTopLine: number
    windowBottomLine: number
    markers: IScrollBarMarker[]
    visible: boolean
}

export interface IScrollBarMarker {
    line: number
    height: number
    color: string
}

const BufferScrollBarWindow = withProps<IBufferScrollBarProps>(styled.div)`
    position: absolute;
    width: ${bufferScrollBarSize};
    height: ${props => ((props.windowBottomLine - props.windowTopLine + 1) / props.bufferSize) * props.height}px;
    height: ${props => ((props.windowTopLine - 1) / props.bufferSize) * props.height}px;
    background-color: rgba(200, 200, 200, 0.2);
    border-top:1px solid rgba(255, 255, 255, 0.1);
    border-bottom:1px solid rgba(255, 255, 255, 0.1);
    `

const Marker = withProps<{ height: number, bufferSize: number, line: number }>(styled.div)`
    position: absolute;
    top: ${props => (props.line / props.bufferSize) * props.height}px;
    height: 2px;
    background-color: ${props => props.color};
    width: 100%;
    `

const StyledBufferScrollBar = styled.div`
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0px;
    background-color: rgba(0, 0, 0, 0.2);
    width: ${bufferScrollBarSize};
    border-bottom: 1px solid black;
    `

export const BufferScrollBar = (props: IBufferScrollBarProps) => {

    if (!props.visible) {
        return null
    }

    const markers = props.markers || []

    const markerElements = markers.map((m) => (
      <Marker
        key={m.line.toString() + m.color}
        height={props.height}
        bufferSize={props.bufferSize}
        color={m.color}
        line={m.line} />
    ))

    return (
      <StyledBufferScrollBar>
            <BufferScrollBarWindow {...props} />
            {markerElements}
        </StyledBufferScrollBar>
    )
}
