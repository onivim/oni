import * as React from "react"

import * as uniqBy from "lodash/uniqBy"
import styled from "styled-components"
import { bufferScrollBarSize } from "./common"

import { editorManager } from "./../../Services/EditorManager"
import { EmptyArray } from "./../../Utility"

export interface IBufferScrollBarProps {
    windowId: number
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

const ScrollBarContainer = styled.div`
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0px;
    background-color: rgba(0, 0, 0, 0.2);
    width: ${bufferScrollBarSize};
    border-bottom: 1px solid black;
    pointer-events: auto;
`

const ScrollBarWindow = styled.div`
    position: absolute;
    width: ${bufferScrollBarSize};
    background-color: rgba(200, 200, 200, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    pointer-events: none;
`

export class BufferScrollBar extends React.PureComponent<IBufferScrollBarProps, {}> {
    constructor(props: any) {
        super(props)
    }

    public render(): JSX.Element {
        if (!this.props.visible) {
            return null
        }

        const windowHeight =
            (this.props.windowBottomLine - this.props.windowTopLine + 1) /
            this.props.bufferSize *
            this.props.height
        const windowTop = (this.props.windowTopLine - 1) / this.props.bufferSize * this.props.height

        const windowStyle: React.CSSProperties = {
            top: windowTop + "px",
            height: windowHeight + "px",
        }

        const markers = this.props.markers || EmptyArray

        const uniqueMarkers = uniqBy(markers, m => m.id)
        const markerElements = uniqueMarkers.map(m => {
            const line = m.line
            const pos = line / this.props.bufferSize * this.props.height
            const size = "2px"

            const markerStyle: React.CSSProperties = {
                position: "absolute",
                top: pos + "px",
                height: size,
                backgroundColor: m.color,
                width: "100%",
                pointerEvents: "none",
            }

            return <div style={markerStyle} key={`${this.props.windowId}_${m.color}_${m.line}`} />
        })

        const setLine = (y: number) => {
            const lineFraction = Math.min(Math.max(y / this.props.height, 0), 1)
            const newLine = Math.ceil(
                editorManager.activeEditor.activeBuffer.lineCount * lineFraction,
            )
            editorManager.activeEditor.activeBuffer.setCursorPosition(newLine, 0)
        }

        const beginScroll = (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault()
            setLine(e.nativeEvent.offsetY)
            document.addEventListener("mousemove", trackScroll, true)
            document.addEventListener("mouseup", endScroll, true)
        }

        const trackScroll = (e: MouseEvent) => {
            e.preventDefault()
            setLine(e.offsetY)
        }

        const endScroll = (e: MouseEvent) => {
            e.preventDefault()
            setLine(e.offsetY)
            document.removeEventListener("mousemove", trackScroll, true)
            document.removeEventListener("mouseup", endScroll, true)
        }

        return (
            <ScrollBarContainer key={this.props.windowId} onMouseDown={beginScroll}>
                <ScrollBarWindow style={windowStyle} />
                {markerElements}
            </ScrollBarContainer>
        )
    }
}
