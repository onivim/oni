import { connect } from "react-redux"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

import { Errors, IErrorsProps } from "./../components/Error"

const mapStateToProps = (state: State.IState): IErrorsProps => {

    const window = Selectors.getActiveWindow(state)
    const errors = Selectors.getErrorsForActiveFile(state)

    const noop = (): any => null

    return {
        errors,
        cursorLine: window ? window.line : 0,
        fontWidthInPixels: state.fontPixelWidth,
        fontHeightInPixels: state.fontPixelHeight,
        bufferToScreen: window ? window.bufferToScreen : noop,
        screenToPixel: window ? window.screenToPixel : noop,
    }
}

export const ErrorsContainer = connect(mapStateToProps)(Errors)
