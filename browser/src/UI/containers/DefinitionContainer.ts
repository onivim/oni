import { connect } from "react-redux"

import * as types from "vscode-languageserver-types"

import * as Selectors from "./../Selectors"
import { getActiveDefinition } from "./../selectors/DefinitionSelectors"

import * as State from "./../State"

import { Definition, IDefinitionProps } from "./../components/Definition"

const emptyRange = types.Range.create(
    types.Position.create(-1, -1),
    types.Position.create(-1, -1),
)

const mapStateToProps = (state: State.IState): IDefinitionProps => {

    const window = Selectors.getActiveWindow(state)

    const noop = (): any => null

    const activeDefinition = getActiveDefinition(state)

    const range = activeDefinition ? activeDefinition.token.range : emptyRange

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
