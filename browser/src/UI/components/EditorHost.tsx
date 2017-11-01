/**
 * EditorHost.tsx
 *
 * React component that hosts an IEditor implementation
 */

import * as React from "react"

import { IEditor } from "./../../Editor/Editor"

export interface IEditorHostProps {
    editor: IEditor
}

export class EditorHost extends React.PureComponent<IEditorHostProps, {}> {

    public render(): JSX.Element {
        return <div className="container vertical full">
                <div className="editor">
                    {this.props.editor.render()}
                </div>
        </div>
    }
}
