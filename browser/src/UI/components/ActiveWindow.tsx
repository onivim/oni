/**
 * ActiveWindow.tsx
 *
 * Helper component that is always sized and positioned around the currently
 * active window in Neovim.
 */

import * as React from "react"
import { connect } from "react-redux"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

import { IWindow } from "./../State"

export interface IActiveWindowProps {
    pixelX: number
    pixelY: number
    pixelWidth: number
    pixelHeight: number
}


export interface INeovimWindowsProps {
    windows: IWindow[]
}

import { BufferScrollBarContainer } from "./../containers/BufferScrollBarContainer"
import { ErrorsContainer } from "./../containers/ErrorsContainer"

export class NeovimWindowsView extends React.PureComponent<INeovimWindowsProps, {}> {

    public render(): JSX.Element[] {

        const fullDiv = <div style={{backgroundColor:"rgba(255, 0, 0, 0.1)", width: "100%", height:"100%"}} />

        const windowContainers = this.props.windows.map((win) => {
            const pixelDimensions = getWindowPixelDimensions(win)

            return <ActiveWindow {...pixelDimensions}>
                    <BufferScrollBarContainer window={win} />
                    <ErrorsContainer window={win} />
                    {fullDiv}
                </ActiveWindow>
        })

        return windowContainers
    }
}

const getWindowPixelDimensions = (win: IWindow) => {

    const start = win.screenToPixel({
        screenX: win.dimensions.x,
        screenY: win.dimensions.y
    })

    const size = win.screenToPixel({
        screenX: win.dimensions.width,
        screenY: win.dimensions.height,
    })

    return {
        pixelX: start.pixelX,
        pixelY: start.pixelY,
        pixelWidth: size.pixelX,
        pixelHeight: size.pixelY,
    }
}

const mapWindowsToProps = (state: State.IState): INeovimWindowsProps => {
    const windows = Object.values(state.windowState.windows).filter((w) => w.dimensions)

    return {
        windows
    }
}

export const NeovimWindows = connect(mapWindowsToProps)(NeovimWindowsView)


export class ActiveWindow extends React.PureComponent<IActiveWindowProps, {}> {
    public render(): JSX.Element {

        const px = (str: number): string => `${str}px`

        const style: React.CSSProperties = {
            position: "absolute",
            left: px(this.props.pixelX),
            top: px(this.props.pixelY),
            width: px(this.props.pixelWidth),
            height: px(this.props.pixelHeight),
        }

        return <div style={style}>
            {this.props.children}
        </div>
    }
}

const mapStateToProps = (state: State.IState): IActiveWindowProps => {
    const dimensions = Selectors.getActiveWindowPixelDimensions(state)
    return {
        pixelX: dimensions.x,
        pixelY: dimensions.y,
        pixelWidth: dimensions.width,
        pixelHeight: dimensions.height,
    }
}

export const ActiveWindowContainer = connect(mapStateToProps)(ActiveWindow)
