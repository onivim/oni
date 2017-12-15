/**
 * ActiveWindow.tsx
 *
 * Helper component that is always sized and positioned around the currently
 * active window in Neovim.
 */

import { connect } from "react-redux"
import styled from "styled-components"
import { withProps } from "./common"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

export interface IActiveWindowProps {
    pixelX: number
    pixelY: number
    pixelWidth: number
    pixelHeight: number
}

const ActiveWindow = withProps<IActiveWindowProps>(styled.div)`
    position: "absolute",
    left: ${props => props.pixelX},
    top: ${props => props.pixelY},
    width: ${props => props.pixelWidth},
    height: ${props => props.pixelHeight},
    `

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
