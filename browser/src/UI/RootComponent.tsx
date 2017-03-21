import * as React from "react"

import { AutoCompletionContainer } from "./components/AutoCompletion"
import { Cursor } from "./components/Cursor"
import { CursorLine } from "./components/CursorLine"
import { EditorHost } from "./components/EditorHost"
import { MenuContainer } from "./components/Menu"
import { QuickInfoContainer, SignatureHelpContainer } from "./components/QuickInfo"

require("./components/StatusBar.less")


import { IEditor } from "./../Editor/Editor"

export class StatusBar extends React.Component<void, void> {

    public render(): JSX.Element {
        return <div className="status-bar" />
    }
}

export interface IRootComponentProps {
    editor: IEditor
}

export class RootComponent extends React.Component<IRootComponentProps, void> {

    public render(): JSX.Element {

        return <div className="container vertical full">

            <div className="container full">
                <EditorHost editor={this.props.editor} />
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
