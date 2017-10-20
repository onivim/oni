/**
 * BufferSelectors.ts
 */

// import { createSelector } from "reselect"

import * as State from "./../State"

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
