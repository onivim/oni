/**
 * PreviewBufferLayer.tsx
 *
 * Buffer layer for showing preview
 */
import * as React from "react"

import * as Oni from "oni-api"

import styled from "styled-components"

import { withProps } from "./../../UI/components/common"

import { EditorManager } from "./../EditorManager"
import { IPreviewer, Preview } from "./index"

const PreviewWrapper = withProps<{}>(styled.div)`
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 0px;
    background-color: ${p => p.theme["editor.background"]};
    color: ${p => p.theme["editor.foreground"]};

    display: flex;
    justify-content: center;
    align-items: center;
`

export class PreviewBufferLayer implements Oni.BufferLayer {
    constructor(private _editorManager: EditorManager, private _preview: Preview) {}

    public get id(): string {
        return "oni.layer.preview"
    }

    public render(): JSX.Element {
        return <PreviewView editorManager={this._editorManager} previewManager={this._preview} />
    }
}

export interface IPreviewViewProps {
    editorManager: EditorManager
    previewManager: Preview
}

export interface IPreviewViewState {
    filePath: string
    language: string

    previewer: IPreviewer
}

export class PreviewView extends React.PureComponent<IPreviewViewProps, IPreviewViewState> {
    // private _filePath = "E:/oni/lib_test/browser/src/UI/components/Arrow"

    constructor(props: any) {
        super(props)
        this.state = {
            previewer: null,
            filePath: null,
            language: null,
        }
    }

    public componentDidMount(): void {
        const currentBuffer = this.props.editorManager.activeEditor.activeBuffer

        if (currentBuffer) {
            const currentPreviewer = this.props.previewManager.getPreviewer(currentBuffer.language)
            this.setState({
                previewer: currentPreviewer,
                language: currentBuffer.language,
                filePath: currentBuffer.filePath,
            })
        }

        this.props.editorManager.anyEditor.onBufferEnter.subscribe(onEnter => {
            const previewer = this.props.previewManager.getPreviewer(onEnter.language)
            this.setState({
                previewer,
                language: onEnter.language,
                filePath: onEnter.filePath,
            })
        })
    }

    public render(): JSX.Element {
        const element = this.state.previewer
            ? this.state.previewer.render({
                  language: this.state.language,
                  filePath: this.state.filePath,
              })
            : null

        return <PreviewWrapper>{element}</PreviewWrapper>
    }
}
