/**
 * Preview.tsx
 *
 * Service for registering live-preview providers
 */
import * as Oni from "oni-api"

import { EditorManager } from "./../EditorManager"

import { PreviewBufferLayer } from "./PreviewBufferLayer"

export interface IPreviewer {
    render(): JSX.Element
}

export type IdToPreviewer = { [id: string]: IPreviewer }

export class Preview {
    private _previewers: IdToPreviewer = {}

    constructor(private _editorManager: EditorManager) {}

    public async openPreview(): Promise<void> {
        const activeEditor: any = this._editorManager.activeEditor
        const buf = await activeEditor.openFile("PREVIEW", {
            openMode: Oni.FileOpenMode.VerticalSplit,
        })
        buf.addLayer(new PreviewBufferLayer(this._editorManager))
        console.log(buf.id)
    }

    public registerPreviewer(id: string, previewer: IPreviewer): void {
        this._previewers[id] = previewer
    }
}
