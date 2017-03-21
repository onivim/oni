import * as path from "path"

import * as React from "react"

import { IncrementalDeltaRegionTracker } from "./../DeltaRegionTracker"
import { NeovimInstance } from "./../NeovimInstance"
import { NeovimScreen } from "./../Screen"
import { DOMRenderer } from "./../Renderer/DOMRenderer"

import { ipcRenderer, remote } from "electron"

import * as Config from "./../Config"

import { PluginManager } from "./../Plugins/PluginManager"

import { AutoCompletion } from "./../Services/AutoCompletion"
import { BufferUpdates } from "./../Services/BufferUpdates"
import { CommandManager } from "./../Services/CommandManager"
import { registerBuiltInCommands } from "./../Services/Commands"
import { Errors } from "./../Services/Errors"
import { Formatter } from "./../Services/Formatter"
import { LiveEvaluation } from "./../Services/LiveEvaluation"
import { MultiProcess } from "./../Services/MultiProcess"
import { OutputWindow } from "./../Services/Output"
import { QuickOpen } from "./../Services/QuickOpen"
import { SyntaxHighlighter } from "./../Services/SyntaxHighlighter"
import { Tasks } from "./../Services/Tasks"
import { WindowTitle } from "./../Services/WindowTitle"

import { ErrorOverlay } from "./../UI/Overlay/ErrorOverlay"
import { LiveEvaluationOverlay } from "./../UI/Overlay/LiveEvaluationOverlay"
import { OverlayManager } from "./../UI/Overlay/OverlayManager"
import { ScrollBarOverlay } from "./../UI/Overlay/ScrollBarOverlay"
import { Rectangle } from "./../UI/Types"

import * as UI from "./../UI/index"

export interface IEditorContext {
    plugins: PluginManager
    commands: CommandManager
    args: any
}

export interface IEditor {
    init(editorContext: IEditorContext)
    render(element: HTMLDivElement): void
}

export interface IEditorHostProps {
    pluginManager: PluginManager
    commandManager: CommandManager
    editor: IEditor
}

export class EditorHost extends React.Component<IEditorHostProps, void> {
    private _element: HTMLElement

    public componentWillMount(): void {
    }

    public componentDidMount(): void {
        if (this._element) {
            this.props.editor.render(this._element)
        }
    }

    public componentWillUnmount(): void {
    }

    public render(): JSX.Element {
        return <div ref={ (elem) => this._element = elem } className = "editor" > </div>
    }
}
