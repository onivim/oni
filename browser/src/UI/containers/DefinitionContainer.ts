import { connect } from "react-redux"

import * as types from "vscode-languageserver-types"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

import { Definition, IDefinitionProps } from "./../components/Definition"

const mapStateToProps = (state: State.IState): IDefinitionProps => {

    const window = Selectors.getActiveWindow(state)

    const noop = (): any => null

    const range = types.Range.create(
        types.Position.create(1, 0),
        types.Position.create(1, 7),
    )

    return {
        color: state.foregroundColor,
        range,
        fontWidthInPixels: state.fontPixelWidth,
        fontHeightInPixels: state.fontPixelHeight,
        bufferToScreen: window ? window.bufferToScreen : noop,
        screenToPixel: window ? window.screenToPixel : noop,
    }
}

export const DefinitionContainer = connect(mapStateToProps)(Definition)
