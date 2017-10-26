/**
 * BufferSelectors.ts
 */

import { createSelector } from "reselect"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

const getBufferState = (state: State.IState) => state.buffers

export const getAllBuffers = createSelector(
    [getBufferState],
    (buffers) => buffers.allIds.map((id) => buffers.byId[id]).filter((buf) => buf.listed))

export const getBufferMetadata = createSelector(
    [getAllBuffers],
    (buffers) => buffers.map((b) => ({
        id: b.id,
        file: b.file,
        modified: b.modified,
    })))

export const getActiveBuffer = createSelector(
    [Selectors.getActiveWindow, getAllBuffers],
    (win, buffers) => {

        if (!win || !win.file) {
            return null
        }

        const buf = buffers.find((b) => b.file === win.file)

        return buf || null
    },
)

export const getActiveBufferId = createSelector(
    [getActiveBuffer],
    (buf) => buf === null ? null : buf.id)
