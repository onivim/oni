import { connect } from "react-redux"

import * as types from "vscode-languageserver-types"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

import { Definition, IDefinitionProps } from "./../components/Definition"

import { noop } from "./../../Utility"

const emptyRange = types.Range.create(
    types.Position.create(-1, -1),
    types.Position.create(-1, -1),
)

export interface IDefinitionContainerProps {
    window: State.IWindow
}

const mapStateToProps = (state: State.IState, definitionProps: IDefinitionContainerProps): IDefinitionProps => {
    const window = definitionProps.window
    const activeDefinition = state.definition

    let range = emptyRange
    if (activeDefinition && Selectors.getActiveWindow(state) === window) {
        range = activeDefinition.token.range
    }

    return {
        color: state.colors["editor.foreground"],
        range,
        fontWidthInPixels: state.fontPixelWidth,
        fontHeightInPixels: state.fontPixelHeight,
        bufferToScreen: window ? window.bufferToScreen : noop,
        screenToPixel: window ? window.screenToPixel : noop,
    }
}

export const DefinitionContainer = connect(mapStateToProps)(Definition)
