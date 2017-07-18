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
import { Rectangle } from "./../Types"

export interface IActiveWindowProps {
    dimensions: Rectangle
}

export class ActiveWindow extends React.PureComponent<IActiveWindowProps, void> {
    public render(): JSX.Element {

        const px = (str: number): string => `${str}px`

        const style: React.CSSProperties = {
            position: "absolute",
            left: px(this.props.dimensions.x),
            top: px(this.props.dimensions.y),
            width: px(this.props.dimensions.width),
            height: px(this.props.dimensions.height),
        }

        return <div style={style}>
            {this.props.children}
        </div>
    }
}

const mapStateToProps = (state: State.IState): IActiveWindowProps => {
    return {
        dimensions: Selectors.getActiveWindowDimensions(state),
    }
}

export const ActiveWindowContainer = connect(mapStateToProps)(ActiveWindow)
