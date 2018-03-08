/**
 * Preview.tsx
 *
 * Service for registering live-preview providers
 */
import * as React from "react"

import * as Oni from "oni-api"

import styled from "styled-components"

import JSONTree from "react-json-tree"

import { EditorManager } from "./../EditorManager"

const PreviewWrapper = styled.div`
    position: absolute;

    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
`

export class PreviewBufferLayer implements Oni.BufferLayer {
    constructor(private _editorManager: EditorManager) {}

    public get id(): string {
        return "oni.layer.preview"
    }

    public render(): JSX.Element {
        return <PreviewView editorManager={this._editorManager} />
    }
}

export interface PreviewViewProps {
    editorManager: EditorManager
}

export interface PreviewViewState {
    element: JSX.Element
}

export class PreviewView extends React.PureComponent<PreviewViewProps, PreviewViewState> {
    private _filePath = "E:/oni/lib_test/browser/src/UI/Icon"

    constructor(props: PreviewViewProps) {
        super(props)
        this.state = {
            element: null,
        }
    }

    public componentDidMount(): void {
        // this.props.editorManager.anyEditor.onBufferEnter.subscribe(bufEvent => {
        //     this.setState({
        //         element: <JSONTree data={bufEvent.filePath} />,
        //     })
        // })

        window.setInterval(() => {
            delete global["require"].cache[global["require"].resolve(this._filePath)] // tslint:disable-line no-string-literal

            const script = global["require"](this._filePath)

            const elem = script && script.preview ? script.preview() : <JSONTree data={script} />

            console.log("SETTING STATE")

            this.setState({
                element: elem,
            })
        }, 200)
    }

    public render(): JSX.Element {
        return <PreviewWrapper>{this.state.element}</PreviewWrapper>
    }
}
