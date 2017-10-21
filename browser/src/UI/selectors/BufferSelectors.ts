/**
 * BufferSelectors.ts
 */

import { createSelector } from "reselect"

import * as Selectors from "./../Selectors"
import * as State from "./../State"

const getAllBuffersFromRootState = (state: State.IState) => getAllBuffers(state.buffers)

export const getAllBuffers = (buffers: State.IBufferState): State.IBuffer[] => {
    return buffers.allIds.map((id) => buffers.byId[id]).filter((buf) => !buf.hidden && buf.listed)
}

export const getBufferByFilename = (fileName: string, buffers: State.IBufferState): State.IBuffer => {
    const allBuffers = getAllBuffers(buffers)
    const matchingBuffers = allBuffers.filter((buf) => buf.file === fileName)

    if (matchingBuffers.length > 0) {
        return matchingBuffers[0]
    } else {
        return null
    }
}

export const getActiveBuffer = createSelector(
    [Selectors.getActiveWindow, getAllBuffersFromRootState],
    (win, buffers) => {

        if (!win || !win.file) {
            return null
        }

        const buf = buffers.find((b) => b.file === win.file)

        return buf || null
    }
)

export const getCurrentBufferLine = createSelector(
    [Selectors.getActiveWindow, getActiveBuffer],
    (win, buffer) => {
        if (!buffer || !buffer.lines) {
            return null
        }

        if (win.file !== buffer.file) {
            return null
        }

        return buffer.lines[win.line]
    }
)
