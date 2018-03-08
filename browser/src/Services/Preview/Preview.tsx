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

export interface IPreviewer {
    render(): JSX.Element
}

export type IdToPreviewer = { [id: string]: IPreviewer }

const PreviewWrapper = styled.div`
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background-color: rgb(40, 44, 52);

    display: flex;
    justify-content: center;
    align-items: center;
`

export class PreviewLayer implements Oni.BufferLayer {
    public get id(): string {
        return "oni.layer.preview"
    }

    public render(): JSX.Element {
        return <PreviewView />
    }
}

export interface PreviewViewState {
    element: JSX.Element
}

export class PreviewView extends React.PureComponent<{}, PreviewViewState> {
    private _filePath = "E:/oni/lib_test/browser/src/UI/components/Arrow"

    constructor(props: any) {
        super(props)
        this.state = {
            element: null,
        }
    }

    public componentDidMount(): void {
        window.setInterval(() => {
            delete global["require"].cache[global["require"].resolve(this._filePath)] // tslint:disable-line no-string-literal

            const script = global["require"](this._filePath)

            console.log("SETTING STATE")

            this.setState({
                element: <JSONTree data={script} />,
            })
        }, 200)
    }

    public render(): JSX.Element {
        return <PreviewWrapper>{this.state.element}</PreviewWrapper>
    }
}

export class Preview {
    private _previewers: IdToPreviewer = {}

    constructor(private _editorManager: EditorManager) {}

    public async openPreview(): Promise<void> {
        const activeEditor: any = this._editorManager.activeEditor
        const buf = await activeEditor.openFile("PREVIEW", "vsp")
        buf.addLayer(new PreviewLayer())
        console.log(buf.id)
    }

    public registerPreviewer(id: string, previewer: IPreviewer): void {
        this._previewers[id] = previewer
    }
}
