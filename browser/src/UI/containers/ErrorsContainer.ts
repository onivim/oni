import { connect } from "react-redux"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

import { Errors, IErrorsProps } from "./../components/Error"

const mapStateToProps = (state: State.IState): IErrorsProps => {

    const window = Selectors.getActiveWindow(state)
    const errors = Selectors.getErrorsForActiveFile(state)

    return {
        errors,
        fontWidthInPixels: state.fontPixelWidth,
        fontHeightInPixels: state.fontPixelHeight,
        window,
    }
}

export const ErrorsContainer = connect(mapStateToProps)(Errors)
