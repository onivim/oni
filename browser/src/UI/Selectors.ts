/**
 * Selectors.ts
 *
 * Selectors are basically helper methods for operating on the State
 * See Redux documents here fore more info:
 * http://redux.js.org/docs/recipes/ComputingDerivedData.html
 */

import * as flatten from "lodash/flatten"
import { createSelector } from "reselect"

import * as Utility from "./../Utility"

import * as State from "./State"

export const EmptyArray: any[] = []

export const getErrors = (state: State.IState) => state.errors

const getAllErrorsForFile = (fileName: string, errors: State.Errors) => {
    if (!fileName || !errors) {
        return EmptyArray
    }

    const allErrorsByKey = errors[fileName]

    if (!allErrorsByKey) {
        return EmptyArray
    }

    const arrayOfErrorsArray = Object.values(allErrorsByKey)
    return flatten(arrayOfErrorsArray)
}

export const getActiveWindow = (state: State.IState): State.IWindow => {
    if (state.windowState.activeWindow === null) {
        return null
    }

    const activeWindow = state.windowState.activeWindow
    return state.windowState.windows[activeWindow]
}

export const getQuickInfo = (state: State.IState): State.IQuickInfo => state.quickInfo

const emptyRectangle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
}

export const getFontPixelWidthHeight = (state: State.IState) => ({
    fontPixelWidth: state.fontPixelWidth,
    fontPixelHeight: state.fontPixelHeight,
})

export const getActiveWindowScreenDimensions = createSelector(
    [getActiveWindow],
    (win) => {
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
    })

export const getErrorsForActiveFile = createSelector(
    [getActiveWindow, getErrors],
    (win, errors) => {
        const errorsForFile = (win && win.file) ? getAllErrorsForFile(win.file, errors) : EmptyArray
        return errorsForFile
    })

export const getErrorsForPosition = createSelector(
    [getActiveWindow, getErrorsForActiveFile],
    (win, errors) => {
        if (!win) {
            return EmptyArray
        }

        const { line, column } = win
        return errors.filter((diag) => Utility.isInRange(line, column, diag.range))
    })

export const getForegroundBackgroundColor = (state: State.IState) => ({
    foregroundColor: state.foregroundColor,
    backgroundColor: state.backgroundColor,
})
