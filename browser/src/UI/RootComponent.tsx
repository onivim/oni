import * as React from "react"

import { AutoCompletionContainer } from "./components/AutoCompletion"
import { Cursor } from "./components/Cursor"
import { CursorLine } from "./components/CursorLine"
import { MenuContainer } from "./components/Menu"
import { QuickInfoContainer, SignatureHelpContainer } from "./components/QuickInfo"

export interface IEditor {
    show(): void
    render(element: HTMLElement): void
    hide(): void

}

export interface IEditorHostProps {
    editor: IEditor
}

export class EditorHost extends React.Component<IEditorHostProps, void> {
    private _element: HTMLElement

    public componentWillMount(): void {
        this.props.editor.show()
    }

    public componentDidMount(): void {
        if (this._element) {
            this.props.editor.render(this._element)
        }
    }

    public componentWillUnmount(): void {
        this.props.editor.hide()
    }

    public render(): JSX.Element {
        return <div ref={(elem) => this._element = elem} className="editor"></div>
    }
}

require("./components/StatusBar.less")

export class StatusBar extends React.Component<void, void> {

    public render(): JSX.Element {
        return <div className="status-bar" />
    }
}

export class RootComponent extends React.Component<void, void> {
    public render(): JSX.Element {

        return <div className="container vertical full">

            <div className="container full">
                <Cursor />
                <CursorLine lineType={"line"} />
                <CursorLine lineType={"column"} />
                <SignatureHelpContainer />
                <QuickInfoContainer />
                <SignatureHelpContainer />
                <MenuContainer />
                <AutoCompletionContainer />
            </div>
            <div className="container">
                <StatusBar />
            </div>
        </div>
    }
}
