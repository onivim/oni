// SyntaxHighlightingSelectors.ts
//
// Reducers for handling state changes from ISyntaxHighlightActions

import {
    ISyntaxHighlightState,
    IBufferSyntaxHighlightState,
    ISyntaxHighlightLineInfo,
} from "./SyntaxHighlightingStore"

export interface SyntaxHighlightRange {
    top: number
    bottom: number
}

export const NullRange: SyntaxHighlightRange = { top: -1, bottom: -1 }

export const getRelevantRange = (
    state: ISyntaxHighlightState,
    bufferId: number | string,
): SyntaxHighlightRange => {
    if (!state.bufferToHighlights[bufferId]) {
        return NullRange
    }

    const buffer = state.bufferToHighlights[bufferId]

    return {
        top: buffer.topVisibleLine,
        bottom: buffer.bottomVisibleLine,
    }
}

export const getLineFromBuffer = (
    state: IBufferSyntaxHighlightState,
    lineNumber: number,
): ISyntaxHighlightLineInfo => {
    if (
        state.insertModeLine &&
        state.insertModeLine.info &&
        state.insertModeLine.version > state.version &&
        state.insertModeLine.lineNumber === lineNumber
    ) {
        return state.insertModeLine.info
    }

    return state.lines[lineNumber]
}
