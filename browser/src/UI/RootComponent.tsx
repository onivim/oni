import * as React from "react"

import { Background } from "./components/Background"
import { EditorHost } from "./components/EditorHost"
import { MenuContainer } from "./components/Menu"
import StatusBar from "./components/StatusBar"

import { IEditor } from "./../Editor/Editor"
import { keyEventToVimKey } from "./../Input/Keyboard"
import { focusManager } from "./../Services/FocusManager"
import { inputManager } from "./../Services/InputManager"
import * as WindowManager from "./../Services/WindowManager"

interface IRootComponentProps {
    windowManager: WindowManager.WindowManager
}

export interface IWindowManagerProps {
    windowManager: WindowManager.WindowManager
}

export interface IWindowManagerState {
    splitRoot: WindowManager.ISplitInfo
}

import * as marked from "marked"

export class WindowManagerComponent extends React.PureComponent<IWindowManagerProps, IWindowManagerState> {

    constructor(props: IWindowManagerProps) {
        super(props)

        this.state = {
            splitRoot: props.windowManager.splitRoot,
        }
    }

    public componentDidMount(): void {
        this.props.windowManager.onSplitChanged.subscribe((newSplit) => {
            this.setState({
                splitRoot: newSplit,
            })
        })
    }

    public render() {
        if (!this.state.splitRoot) {
            return null
        }

        const containerStyle = {
            "display": "flex",
            "flex-direction": "row",
            "width": " 100%",
            "height": " 100%",
        }

        const editors = this.state.splitRoot.splits.map((split) => {
            if (split.type === "Split") {
                return null
            } else {
                const anyEditor: any = split.editor

                if (!anyEditor) {
                    return <div className="container vertical full">test</div>
                } else {
                    return <EditorHost editor={anyEditor} />
                }
            }
        })

        return <div style={containerStyle}>
                    {editors}
                </div>
    }
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
                            <WindowManagerComponent windowManager={this.props.windowManager} />
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

    private _onRootKeyDown(evt: React.KeyboardEvent<HTMLElement>): void {
        const vimKey = keyEventToVimKey(evt.nativeEvent)
        if (inputManager.handleKey(vimKey)) {
            evt.stopPropagation()
            evt.preventDefault()
        } else {
            focusManager.enforceFocus()
        }
    }
}
