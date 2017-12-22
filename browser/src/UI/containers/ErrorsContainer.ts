import { connect } from "react-redux"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

import { Errors, IErrorsProps } from "./../components/Error"

import { noop } from "./../../Utility"

export interface IErrorContainerProps {
    window: State.IWindow
}

const mapStateToProps = (state: State.IState, containerProps: IErrorContainerProps): IErrorsProps => {

    const win = containerProps.window
    const errors = Selectors.getAllErrorsForFile(win.file, state.errors)

    return {
        errors,
        cursorLine: win ? win.line : 0,
        fontWidthInPixels: state.fontPixelWidth,
        fontHeightInPixels: state.fontPixelHeight,
        bufferToScreen: win ? win.bufferToScreen : noop,
        screenToPixel: win ? win.screenToPixel : noop,
    }
}

export const ErrorsContainer = connect(mapStateToProps)(Errors)
