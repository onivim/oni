/**
 * EditorHost.tsx
 *
 * React component that hosts an IEditor implementation
 */

import * as path from "path"

import * as React from "react"

import { PluginManager } from "./../../Plugins/PluginManager"
import { CommandManager } from "./../../Services/CommandManager"

import { IEditor } from "./../../Editor/Editor"

export interface IEditorHostProps {
    pluginManager: PluginManager
    commandManager: CommandManager
    editor: IEditor
}

export class EditorHost extends React.Component<IEditorHostProps, void> {
    private _element: HTMLDivElement

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
