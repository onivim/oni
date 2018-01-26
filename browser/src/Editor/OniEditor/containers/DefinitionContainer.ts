import { connect } from "react-redux"

import * as types from "vscode-languageserver-types"

import { Definition, IDefinitionProps } from "./../../../UI/components/Definition"

import * as Selectors from "./../../NeovimEditor/NeovimEditorSelectors"
import * as State from "./../../NeovimEditor/NeovimEditorStore"

const emptyRange = types.Range.create(types.Position.create(-1, -1), types.Position.create(-1, -1))

const getActiveDefinition = (state: State.IState) => state.definition

const mapStateToProps = (state: State.IState): IDefinitionProps => {
    const window = Selectors.getActiveWindow(state)

    const noop = (): any => null

    const activeDefinition = getActiveDefinition(state)

    const range = activeDefinition ? activeDefinition.token.range : emptyRange

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
