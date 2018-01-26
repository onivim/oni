/**
 * Selectors.ts
 *
 * Selectors are basically helper methods for operating on the State
 * See Redux documents here fore more info:
 * http://redux.js.org/docs/recipes/ComputingDerivedData.html
 */

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import { createSelector } from "reselect"

import { getAllErrorsForFile } from "./../../Services/Diagnostics"
import * as Utility from "./../../Utility"

import * as State from "./NeovimEditorStore"

export const EmptyArray: any[] = []

const getWindows = (state: State.IState) => state.windowState

export const getActiveWindow = createSelector([getWindows], windowState => {
    if (windowState.activeWindow === null) {
        return null
    }

    const activeWindow = windowState.activeWindow
    return windowState.windows[activeWindow]
})

const emptyRectangle: Oni.Shapes.Rectangle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
}

export const getFontPixelWidthHeight = (state: State.IState) => ({
    fontPixelWidth: state.fontPixelWidth,
    fontPixelHeight: state.fontPixelHeight,
})

export const getActiveWindowScreenDimensions = createSelector([getActiveWindow], win => {
    if (!win || !win.dimensions) {
        return emptyRectangle
    }

    return win.dimensions
})

export const getActiveWindowPixelDimensions = createSelector(
    [getActiveWindowScreenDimensions, getFontPixelWidthHeight],
    (dimensions, fontSize) => {
        const pixelDimensions = {
            x: dimensions.x * fontSize.fontPixelWidth,
            y: dimensions.y * fontSize.fontPixelHeight,
            width: dimensions.width * fontSize.fontPixelWidth,
            height: dimensions.height * fontSize.fontPixelHeight,
        }

        return pixelDimensions
    },
)

export const getErrors = (state: State.IState) => state.errors

export const getErrorsForActiveFile = createSelector(
    [getActiveWindow, getErrors],
    (win, errors) => {
        const errorsForFile: types.Diagnostic[] =
            win && win.file
                ? getAllErrorsForFile(win.file, errors)
                : (EmptyArray as types.Diagnostic[])
        return errorsForFile
    },
)

export const getErrorsForPosition = createSelector(
    [getActiveWindow, getErrorsForActiveFile],
    (win, errors) => {
        if (!win) {
            return EmptyArray
        }

        const { line, column } = win
        return errors.filter(diag => Utility.isInRange(line, column, diag.range))
    },
)

const getBufferState = (state: State.IState) => state.buffers

export const getAllBuffers = createSelector([getBufferState], buffers =>
    buffers.allIds.map(id => buffers.byId[id]).filter(buf => buf.listed),
)

export const getBufferMetadata = createSelector([getAllBuffers], buffers =>
    buffers.map(b => ({
        id: b.id,
        file: b.file,
        modified: b.modified,
        title: b.title,
    })),
)

export const getActiveBuffer = createSelector([getActiveWindow, getAllBuffers], (win, buffers) => {
    if (!win || !win.file) {
        return null
    }

    const buf = buffers.find(b => b.file === win.file)

    return buf || null
})

export const getActiveBufferId = createSelector(
    [getActiveBuffer],
    buf => (buf === null ? null : buf.id),
)
