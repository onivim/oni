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

export interface IActiveWindowProps {
    pixelX: number
    pixelY: number
    pixelWidth: number
    pixelHeight: number
}

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
