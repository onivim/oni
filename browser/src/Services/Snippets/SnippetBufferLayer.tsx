/**
 * SnippetBufferLayer.tsx
 *
 * UX for the Snippet functionality, implemented as a buffer layer
 */

import * as React from "react"

import styled, { keyframes } from "styled-components"

import * as Oni from "oni-api"

import * as types from "vscode-languageserver-types"

import { SnippetSession } from "./SnippetSession"

export class SnippetBufferLayer implements Oni.EditorLayer {
    constructor(private _buffer: Oni.Buffer, private _snippetSession: SnippetSession) {
        this._buffer.addLayer(this)
    }

    public get id(): string {
        return "oni.layers.snippet"
    }

    public get friendlyName(): string {
        return "Snippet"
    }

    public render(context: Oni.EditorLayerRenderContext): JSX.Element {
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
    context: Oni.EditorLayerRenderContext
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

export class SnippetBufferLayerView extends React.PureComponent<ISnippetBufferLayerViewProps, {}> {
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
            </div>
        )
    }
}
