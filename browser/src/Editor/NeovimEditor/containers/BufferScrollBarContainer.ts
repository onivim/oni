import * as types from "vscode-languageserver-types"

import { connect } from "react-redux"
import { createSelector } from "reselect"

import { getColorFromSeverity } from "./../../../Services/Errors"
import { BufferScrollBar, IBufferScrollBarProps, IScrollBarMarker } from "./../../../UI/components/BufferScrollBar"

import * as Selectors from "./../NeovimEditorSelectors"
import * as State from "./../NeovimEditorStore"

export const getCurrentLine = createSelector(
    [Selectors.getActiveWindow],
    (activeWindow) => {
        return activeWindow.line
    })

const NoScrollBar: IBufferScrollBarProps = {
    windowId: null,
    bufferSize: -1,
    height: -1,
    windowTopLine: -1,
    windowBottomLine: -1,
    markers: [],
    visible: false,
}

export const shouldIncludeCursorMarker = (state: State.IState) => {
    return state.configuration["editor.scrollBar.cursorTick.visible"]
}

export const getMarkers = createSelector(
    [getCurrentLine, Selectors.getErrorsForActiveFile, shouldIncludeCursorMarker],
    (activeLine, fileErrors, includeCursor) => {
        const errorMarkers = fileErrors.map((e: types.Diagnostic) => ({
            line: e.range.start.line || 0,
            height: 1,
            color: getColorFromSeverity(e.severity),
        }))

        if (!includeCursor) {
            return errorMarkers
        } else {
            const cursorMarker: IScrollBarMarker = {
                line: activeLine - 1,
                height: 1,
                color: "rgb(200, 200, 200)",
            }

            return [...errorMarkers, cursorMarker]
        }
    })

const mapStateToProps = (state: State.IState): IBufferScrollBarProps => {
    const visible = state.configuration["editor.scrollBar.visible"]

    const activeWindow = Selectors.getActiveWindow(state)

    if (!activeWindow) {
        return NoScrollBar
    }

    const dimensions = Selectors.getActiveWindowPixelDimensions(state)

    const file = activeWindow.file
    const buffer = Selectors.getActiveBuffer(state)

    if (file === null || !buffer) {
        return NoScrollBar
    }

    const bufferSize = buffer.totalLines

    const markers = getMarkers(state)

    return {
        windowId: activeWindow.windowId,
        windowTopLine: activeWindow.topBufferLine,
        windowBottomLine: activeWindow.bottomBufferLine,
        bufferSize,
        markers,
        height: dimensions.height,
        visible,
    }
}

export const BufferScrollBarContainer = connect(mapStateToProps)(BufferScrollBar)
