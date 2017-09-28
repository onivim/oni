import * as React from "react"

import { Background } from "./components/Background"
import { EditorHost } from "./components/EditorHost"
import { MenuContainer } from "./components/Menu"
import StatusBar from "./components/StatusBar"

import { IEditor } from "./../Editor/Editor"
import { keyEventToVimKey } from "./../Input/Keyboard"
import { focusManager } from "./../Services/FocusManager"
import { inputManager } from "./../Services/InputManager"

interface IRootComponentProps {
    editor: IEditor
}

export class RootComponent extends React.PureComponent<IRootComponentProps, void> {
    public render() {
        return <div className="stack disable-mouse" onKeyDownCapture={(evt) => this._onRootKeyDown(evt)}>
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

    private _onRootKeyDown(evt: any): void {
        const vimKey = keyEventToVimKey(evt)
        if (inputManager.handleKey(vimKey)) {
            evt.stopPropagation()
            evt.preventDefault()
        } else {
            focusManager.enforceFocus()
        }
    }
}
