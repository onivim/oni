import * as React from "react"

import { Background } from "./components/Background"
import { EditorHost } from "./components/EditorHost"
import { Logs } from "./components/Logs"
import { MenuContainer } from "./components/Menu"
import StatusBar from "./components/StatusBar"

import { IEditor } from "./../Editor/Editor"

interface IRootComponentProps {
    editor: IEditor
}

export class RootComponent extends React.Component<IRootComponentProps, void> {
    public render() {
        return <div className="stack disable-mouse">
            <div className="stack">
                <Background />
            </div>
            <div className="stack">
                <div className="container vertical full">
                    <div className="container full">
                        <div className="stack">
                            <EditorHost editor={this.props.editor} />
                        </div>
                        <div className="stack layer">
                            <Logs />
                            <MenuContainer />
                        </div>
                    </div>
                    <div className="container fixed layer">
                        <StatusBar />
                    </div>
                </div>
            </div>
        </div>
    }
}
