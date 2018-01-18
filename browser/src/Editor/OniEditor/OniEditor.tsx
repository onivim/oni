/**
 * NeovimEditor.ts
 *
 * IEditor implementation for Neovim
 */

// import * as React from "react"


import * as Oni from "oni-api"
import { IEvent } from "oni-types"

import * as Log from "./../../Log"

import { PluginManager } from "./../../Plugins/PluginManager"

import { IColors } from "./../../Services/Colors"
import { Configuration } from "./../../Services/Configuration"
import { IDiagnosticsDataSource } from "./../../Services/Diagnostics"

import {
    LanguageManager,
} from "./../../Services/Language"

import {
    ISyntaxHighlighter,
} from "./../../Services/SyntaxHighlighting"

import { ThemeManager } from "./../../Services/Themes"
import { Workspace } from "./../../Services/Workspace"

import { IEditor } from "./../Editor"

// import { BufferScrollBarContainer } from "./containers/BufferScrollBarContainer"
// import { DefinitionContainer } from "./containers/DefinitionContainer"
// import { ErrorsContainer } from "./containers/ErrorsContainer"

import { NeovimEditor } from "./../NeovimEditor"

export class OniEditor implements IEditor {

    private _neovimEditor: NeovimEditor

    public get mode(): string {
        return this._neovimEditor.mode
    }

    public get onCursorMoved(): IEvent<Oni.Cursor> {
        return this._neovimEditor.onCursorMoved
    }

    public get onModeChanged(): IEvent<Oni.Vim.Mode> {
        return this._neovimEditor.onModeChanged
    }

    public get onBufferEnter(): IEvent<Oni.EditorBufferEventArgs> {
        return this._neovimEditor.onBufferEnter
    }

    public get onBufferLeave(): IEvent<Oni.EditorBufferEventArgs> {
        return this._neovimEditor.onBufferLeave
    }

    public get onBufferChanged(): IEvent<Oni.EditorBufferChangedEventArgs> {
        return this._neovimEditor.onBufferChanged
    }

    public get onBufferSaved(): IEvent<Oni.EditorBufferEventArgs> {
        return this._neovimEditor.onBufferSaved
    }

    public get onBufferScrolled(): IEvent<Oni.EditorBufferScrolledEventArgs> {
        return this._neovimEditor.onBufferScrolled
    }

    public /* override */ get activeBuffer(): Oni.Buffer {
        return this._neovimEditor.activeBuffer
    }

    // Capabilities
    public get neovim(): Oni.NeovimEditorCapability {
        return this._neovimEditor.neovim
    }

    public get syntaxHighlighter(): ISyntaxHighlighter {
        return this._neovimEditor.syntaxHighlighter
    }

    constructor(
         colors: IColors,
         configuration: Configuration,
         diagnostics: IDiagnosticsDataSource,
         languageManager: LanguageManager,
         pluginManager: PluginManager,
         themeManager: ThemeManager,
         workspace: Workspace,
    ) {
        this._neovimEditor = new NeovimEditor(colors, configuration, diagnostics, languageManager, pluginManager, themeManager, workspace)

//         this._bufferLayerManager.addBufferLayer("*", (buf) => ({
//             id: "test",
//             render: (context) =>{
//                 return context.isActive ?  <BufferScrollBarContainer /> : null
//             }
//         }))

//         this._bufferLayerManager.addBufferLayer("*", (buf) => ({
//             id: "test2",
//             render: (context) =>{
//                 return context.isActive ?  <DefinitionContainer /> : null
//             }
//         }))

//         this._bufferLayerManager.addBufferLayer("*", (buf) => ({
//             id: "test3",
//             render: (context) =>{
//                 return context.isActive ?  <ErrorsContainer /> : null
//             }
//         }))

    }

    public dispose(): void {

        if (this._neovimEditor) {
            this._neovimEditor.dispose()
            this._neovimEditor = null
        }
    }

    public enter(): void {
        Log.info("[OniEditor::enter]")
        this._neovimEditor.enter()
    }

    public leave(): void {
        Log.info("[OniEditor::leave]")
        this._neovimEditor.leave()
    }

    public async openFile(file: string): Promise<Oni.Buffer> {
        return this._neovimEditor.openFile(file)
    }

    public async newFile(filePath: string): Promise<Oni.Buffer> {
        return this._neovimEditor.newFile(filePath)
    }

    public executeCommand(command: string): void {
        this._neovimEditor.executeCommand(command)
    }

    public async init(filesToOpen: string[]): Promise<void> {
        Log.info("[OniEditor::init] Called with filesToOpen: " + filesToOpen)

        return this._neovimEditor.init(filesToOpen)
    }

    public render(): JSX.Element {
        return this._neovimEditor.render()
    }
}
