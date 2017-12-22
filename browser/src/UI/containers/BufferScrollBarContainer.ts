import * as types from "vscode-languageserver-types"

import { connect } from "react-redux"
import * as Selectors from "./../Selectors"
import { getAllBuffers, getBufferFromFile } from "./../selectors/BufferSelectors"
import * as State from "./../State"

import { BufferScrollBar, IBufferScrollBarProps, IScrollBarMarker } from "./../components/BufferScrollBar"

import { getColorFromSeverity } from "./../../Services/Errors"

import { createSelector } from "reselect"

export const getCurrentLine = createSelector(
    [Selectors.getActiveWindow],
    (activeWindow) => {
        return activeWindow.line
    })

const NoScrollBar: IBufferScrollBarProps = {
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

const getMarkers = (win: State.IWindow, errorsForFile: State.Errors, includeCursor: boolean) => {

    const fileErrors = Selectors.getAllErrorsForFile(win.file, errorsForFile)
    const errorMarkers = fileErrors.map((e: types.Diagnostic) => ({
        line: e.range.start.line || 0,
        height: 1,
        color: getColorFromSeverity(e.severity),
    }))

    if (!includeCursor) {
        return errorMarkers
    } else {
        const cursorMarker: IScrollBarMarker = {
            line: win.line - 1,
            height: 1,
            color: "rgb(200, 200, 200)",
        }

        return [...errorMarkers, cursorMarker]
    }
    
}

export interface IContainerProps {
    window: State.IWindow
}

const mapStateToProps = (state: State.IState, containerProps: IContainerProps): IBufferScrollBarProps => {
    const visible = state.configuration["editor.scrollBar.visible"]

    const activeWindow = containerProps.window

    if (!activeWindow) {
        return NoScrollBar
    }

    const size = activeWindow.screenToPixel({
        screenX: activeWindow.dimensions.width,
        screenY: activeWindow.dimensions.height,
    })

    const file = activeWindow.file

    const allBuffers = getAllBuffers(state)
    const buffer = getBufferFromFile(allBuffers, file)

    if (file === null || !buffer) {
        return NoScrollBar
    }

    const bufferSize = buffer.totalLines

    const markers = getMarkers(activeWindow, state.errors, shouldIncludeCursorMarker(state))

    return {
        windowTopLine: activeWindow.topBufferLine,
        windowBottomLine: activeWindow.bottomBufferLine,
        bufferSize,
        markers,
        height: size.pixelY,
        visible,
    }
}

export const BufferScrollBarContainer = connect(mapStateToProps)(BufferScrollBar)
