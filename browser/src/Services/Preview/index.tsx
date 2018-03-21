/**
 * Preview.tsx
 *
 * Service for registering live-preview providers
 */

import * as React from "react"

import * as Oni from "oni-api"

import { CallbackCommand, CommandManager } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { EditorManager } from "./../EditorManager"

import { PreviewBufferLayer } from "./PreviewBufferLayer"

export interface PreviewContext {
    filePath: string
    language: string
}

export interface IPreviewer {
    render(previewContext: PreviewContext): JSX.Element
}

export type IdToPreviewer = { [id: string]: IPreviewer }
export type LanguageToDefaultPreviewer = { [id: string]: IPreviewer }

export class NoopPreviewer {
    public render(previewContext: PreviewContext): JSX.Element {
        return (
            <div>
                <div>no-op previewer for: {previewContext.filePath}</div>
                <div>language: {previewContext.language}</div>
            </div>
        )
    }
}

export class NullPreviewer {
    public render(previewContext: PreviewContext): JSX.Element {
        return <div>No previewer registered for this filetype</div>
    }
}

export class Preview {
    // private _previewers: IdToPreviewer = {}
    private _defaultPreviewers: LanguageToDefaultPreviewer = {}

    constructor(private _editorManager: EditorManager) {
        this.registerDefaultPreviewer("html", new NoopPreviewer())
    }

    public async openPreviewPane(
        openMode: Oni.FileOpenMode = Oni.FileOpenMode.VerticalSplit,
    ): Promise<void> {
        const activeEditor: any = this._editorManager.activeEditor
        const buf = await activeEditor.openFile("PREVIEW", { openMode })
        buf.addLayer(new PreviewBufferLayer(this._editorManager, this))
        console.log(buf.id)
    }

    public registerDefaultPreviewer(language: string, previewer: IPreviewer): void {
        this._defaultPreviewers[language] = previewer
    }

    public getPreviewer(language: string): IPreviewer {
        if (this._defaultPreviewers[language]) {
            return this._defaultPreviewers[language]
        } else {
            return new NullPreviewer()
        }
    }
}

let _preview: Preview

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
) => {
    _preview = new Preview(editorManager)

    if (configuration.getValue("experimental.preview.enabled")) {
        commandManager.registerCommand(
            new CallbackCommand(
                "preview.open",
                "Preview: Open in Vertical Split",
                "Open preview pane in a vertical split",
                () => _preview.openPreviewPane(Oni.FileOpenMode.VerticalSplit),
            ),
        )
    }
}
