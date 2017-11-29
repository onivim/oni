/**
 * Selectors.ts
 *
 * Selectors are basically helper methods for operating on the State
 * See Redux documents here fore more info:
 * http://redux.js.org/docs/recipes/ComputingDerivedData.html
 */

import * as flatten from "lodash/flatten"
import { createSelector } from "reselect"

import * as types from "vscode-languageserver-types"

import * as Utility from "./../Utility"

import * as State from "./State"

export const EmptyArray: any[] = []

export const getErrors = (state: State.IState) => state.errors

const getAllErrorsForFile = (fileName: string, errors: State.Errors): types.Diagnostic[] => {
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

const getWindows = (state: State.IState) => state.windowState

export const getActiveWindow = createSelector(
    [getWindows],
    (windowState) => {
        if (windowState.activeWindow === null) {
            return null
        }

        const activeWindow = windowState.activeWindow
        return windowState.windows[activeWindow]
    })

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
        const errorsForFile: types.Diagnostic[] = (win && win.file) ? getAllErrorsForFile(win.file, errors) : (EmptyArray as types.Diagnostic[])
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
