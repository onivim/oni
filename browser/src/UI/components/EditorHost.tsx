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

export class EditorHost extends React.Component<IEditorHostProps, void> {

    public render(): JSX.Element {
        return <div className="container vertical full">
            <div className="container fixed">
                <div className="tabs horizontal enable-mouse">
                    <div className="tab not-selected">
                        <div className="name">App.ts</div>
                    </div>
                    <div className="tab selected">
                        <div className="name">NeovimInstance.ts</div>
                    </div>
                    <div className="tab not-selected">
                        <div className="name">Test.ts</div>
                    </div>
                </div>
            </div>
            <div className="container full">
                <div className="editor">
                    {this.props.editor.render()}
                </div>
            </div>
        </div>
    }
}
