/**
 * SnippetBufferLayer.tsx
 *
 * UX for the Snippet functionality, implemented as a buffer layer
 */

import * as React from "react"

import styled, { keyframes } from "styled-components"

import * as Oni from "oni-api"
import { IDisposable } from "oni-types"

import * as types from "vscode-languageserver-types"

import { SnippetSession } from "./SnippetSession"

export class SnippetBufferLayer implements Oni.BufferLayer {
    constructor(private _buffer: Oni.Buffer, private _snippetSession: SnippetSession) {
        this._buffer.addLayer(this)
    }

    public get id(): string {
        return "oni.layers.snippet"
    }

    public get friendlyName(): string {
        return "Snippet"
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        return <SnippetBufferLayerView context={context} snippetSession={this._snippetSession} />
    }

    public dispose(): void {
        if (this._buffer) {
            ;(this._buffer as any).removeLayer(this)

            this._buffer = null
            this._snippetSession = null
        }
    }
}

export interface ISnippetBufferLayerViewProps {
    context: Oni.BufferLayerRenderContext
    snippetSession: SnippetSession
}

const EntranceKeyFrames = keyframes`
    0% { opacity: 0; }
    100% { opacity: 1; }
`

const NonSnippetOverlayTop = styled.div`
    animation: ${EntranceKeyFrames} 0.2s ease-in;
    background-color: rgba(0, 0, 0, 0.1);
    box-shadow: inset 0 -5px 10px rgba(0, 0, 0, 0.2);
`

const NonSnippetOverlayBottom = styled.div`
    animation: ${EntranceKeyFrames} 0.2s ease-in;
    background-color: rgba(0, 0, 0, 0.1);
    box-shadow: inset 0 5px 10px rgba(0, 0, 0, 0.2);
`

export interface ISnippetBufferLayerViewState {
    cursors: types.Position[]
}

export class SnippetBufferLayerView extends React.PureComponent<
    ISnippetBufferLayerViewProps,
    ISnippetBufferLayerViewState
> {
    private _disposables: IDisposable[] = []

    constructor(props: ISnippetBufferLayerViewProps) {
        super(props)

        this.state = {
            cursors: [],
        }
    }

    public componentDidMount(): void {
        this._cleanup()

        const s1 = this.props.snippetSession.onCursorMoved.subscribe(p => {
            this.setState({
                cursors: p.cursors,
            })
        })

        this._disposables = [s1]
    }

    public componentWillUnmount(): void {
        this._cleanup()
    }

    public render(): JSX.Element {
        if (!this.props.context.screenToPixel || !this.props.context.bufferToScreen) {
            return null
        }

        const fullScreenSize = this.props.context.dimensions

        // Get screen size in pixel space
        const fullSizeInPixels = this.props.context.screenToPixel({
            screenX: fullScreenSize.width,
            screenY: fullScreenSize.height,
        })

        const snippetStartPosition = this.props.snippetSession.position.line
        const snippetEndPosition =
            this.props.snippetSession.position.line + this.props.snippetSession.lines.length

        const startPositionInPixels = this.props.context.screenToPixel(
            this.props.context.bufferToScreen(types.Position.create(snippetStartPosition, 0)),
        )
        const endPositionInPixels = this.props.context.screenToPixel(
            this.props.context.bufferToScreen(types.Position.create(snippetEndPosition, 0)),
        )

        const topOverlay: React.CSSProperties = {
            position: "absolute",
            top: "0px",
            left: "0px",
            right: "0px",
            height: startPositionInPixels.pixelY.toString() + "px",
        }

        const bottomOverlay: React.CSSProperties = {
            position: "absolute",
            height: (fullSizeInPixels.pixelY - endPositionInPixels.pixelY).toString() + "px",
            left: "0px",
            bottom: "0px",
            right: "0px",
        }

        const cursors = this.state.cursors.map(c => {
            const pos = this.props.context.screenToPixel(this.props.context.bufferToScreen(c))

            const size = this.props.context.screenToPixel(
                this.props.context.bufferToScreen(types.Position.create(1, 1)),
            )

            const style: React.CSSProperties = {
                position: "absolute",
                top: pos.pixelY.toString() + "px",
                left: pos.pixelX.toString() + "px",
                width: "2px",
                height: size.pixelY.toString() + "px",
                backgroundColor: "white",
            }

            return <div style={style} />
        })

        return (
            <div
                style={{
                    position: "absolute",
                    top: "0px",
                    bottom: "0px",
                    left: "0px",
                    right: "0px",
                }}
            >
                <NonSnippetOverlayTop style={topOverlay} />
                <NonSnippetOverlayBottom style={bottomOverlay} />
                {cursors}
            </div>
        )
    }

    private _cleanup(): void {
        this._disposables.forEach(d => d.dispose())

        this._disposables = []
    }
}
