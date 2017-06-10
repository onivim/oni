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
    private _element: HTMLDivElement

    public componentDidMount(): void {
        if (this._element) {
            this.props.editor.render(this._element)
        }
    }

    public render(): JSX.Element {
        return <div className="container vertical full">
            <div className="container fixed">
                <div className="tabs horizontal">
                    <div className="tab">
                        <div className="tab-filler" />
                        <div className="tab-inner selected" />
                    </div>
                    <div className="tab">
                        <div className="tab-filler" />
                        <div className="tab-inner" />
                    </div>

                </div>
            </div>
            <div className="container full">
                <div ref={(elem) => this._element = elem} className="editor"></div>
            </div>
        </div>
    }
}
