// SyntaxHighlightingSelectors.ts
//
// Reducers for handling state changes from ISyntaxHighlightActions

import {
    IBufferSyntaxHighlightState,
    ISyntaxHighlightLineInfo,
    ISyntaxHighlightState,
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
    const currentLine = state.lines[lineNumber]

    if (
        state.insertModeLine &&
        state.insertModeLine.info &&
        state.insertModeLine.version > currentLine.version &&
        state.insertModeLine.lineNumber === lineNumber
    ) {
        return state.insertModeLine.info
    }

    return currentLine
}
