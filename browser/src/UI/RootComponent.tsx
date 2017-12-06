import * as React from "react"

import * as Platform from "./../Platform"

import { getKeyEventToVimKey } from "./../Input/Keyboard"
import { focusManager } from "./../Services/FocusManager"
import { inputManager } from "./../Services/InputManager"
import { MenuContainer } from "./../Services/Menu"
import * as WindowManager from "./../Services/WindowManager"

import { Background } from "./components/Background"
import StatusBar from "./components/StatusBar"
import { WindowSplits } from "./components/WindowSplits"
import { WindowTitle } from "./components/WindowTitle"

interface IRootComponentProps {
    windowManager: WindowManager.WindowManager
}

const titleBarVisible = Platform.isMac()

import * as State from "./State"
import { connect } from "react-redux"

export interface ILoadingViewProps {
    visible: boolean
}

export class LoadingView extends React.PureComponent<ILoadingViewProps, {}> { 
    public render(): JSX.Element {
        const style: React.CSSProperties = {
            position: "absolute",
            top: "0px",
            left: "0px",
            right: "0px",
            bottom: "0px",
            backgroundColor: "black",
            display: this.props.visible ? "block" : "none",
        }

        return <div style={style}>LOADING</div>
    }
}

const mapStateToProps = (state: State.IState): ILoadingViewProps => {
    return {
        visible: !state.isLoaded
    }
}

export const Loading = connect(mapStateToProps)(LoadingView)

export class RootComponent extends React.PureComponent<IRootComponentProps, {}> {

    public render() {
        return <div className="stack disable-mouse" onKeyDownCapture={(evt) => this._onRootKeyDown(evt)}>
            <div className="stack">
                <Background />
            </div>
            <div className="stack">
                <div className="container vertical full">
                    <div className="container fixed">
                        <WindowTitle visible={titleBarVisible} />
                    </div>
                    <div className="container full">
                        <div className="stack">
                            <WindowSplits windowManager={this.props.windowManager} />
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
            <Loading/>
        </div>
    }

    private _onRootKeyDown(evt: React.KeyboardEvent<HTMLElement>): void {
        const vimKey = getKeyEventToVimKey()(evt.nativeEvent)
        if (inputManager.handleKey(vimKey)) {
            evt.stopPropagation()
            evt.preventDefault()
        } else {
            focusManager.enforceFocus()
        }
    }
}
