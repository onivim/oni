/**
 * ShellView is the root UI / React component
 */

import * as React from "react"

import * as Platform from "./../../Platform"

import { focusManager } from "./../../Services/FocusManager"
import { inputManager } from "./../../Services/InputManager"
import { IThemeColors } from "./../../Services/Themes/ThemeManager"
import { windowManager } from "./../../Services/WindowManager"

import { WindowSplitsView, WindowManager } from "oni-core-window-manager"

import { Background } from "./../components/Background"
import { ThemeProvider } from "./../components/common"
import { Loading } from "./../components/Loading"
import StatusBar from "./../components/StatusBar"

import { WindowTitle } from "./../components/WindowTitle"

import { Overlays } from "./OverlayView"

interface IShellViewComponentProps {
    theme: IThemeColors
    windowManager: WindowManager
}

const titleBarVisible = Platform.isMac()

export class ShellView extends React.PureComponent<IShellViewComponentProps, {}> {
    public render() {
        return (
            <ThemeProvider theme={this.props.theme}>
                <div
                    className="stack disable-mouse"
                    onKeyDownCapture={evt => this._onRootKeyDown(evt)}
                >
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
                                    <WindowSplitsView windowManager={windowManager} />
                                </div>
                                <Overlays />
                            </div>
                            <div className="container fixed layer">
                                <StatusBar />
                            </div>
                        </div>
                    </div>
                    <Loading />
                </div>
            </ThemeProvider>
        )
    }

    private _onRootKeyDown(evt: React.KeyboardEvent<HTMLElement>): void {
        const vimKey = inputManager.resolvers.resolveKeyEvent(evt.nativeEvent)
        if (inputManager.handleKey(vimKey)) {
            evt.stopPropagation()
            evt.preventDefault()
        } else {
            focusManager.enforceFocus()
        }
    }
}
