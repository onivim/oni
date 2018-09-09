/**
 * navigateErrors.ts
 *
 * Functions to jump to previous/next diagnostic error in the active buffer
 */
import { isInRange } from "./../../Utility"
import { getAllErrorsForFile, getInstance as getDiagnosticsInstance } from "./../Diagnostics"
import { editorManager } from "./../EditorManager"

export const gotoNextError = async () => {
    const errors = getDiagnosticsInstance().getErrors()
    const activeBuffer = editorManager.activeEditor.activeBuffer
    const currentFileErrors = getAllErrorsForFile(activeBuffer.filePath, errors)
    const currentPosition = activeBuffer.cursor

    if (!currentFileErrors || !currentFileErrors.length) {
        return
    }

    for (const error of currentFileErrors) {
        if (isInRange(currentPosition.line, currentPosition.column, error.range)) {
            continue
        }

        const currentLine = (await activeBuffer.getLines(currentPosition.line))[0]
        if (
            currentPosition.line === error.range.start.line &&
            currentLine.length <= error.range.start.character
        ) {
            continue
        }

        if (
            error.range.start.line > currentPosition.line ||
            (error.range.start.line === currentPosition.line &&
                error.range.start.character > currentPosition.column)
        ) {
            await activeBuffer.setCursorPosition(
                error.range.start.line,
                error.range.start.character,
            )
            return
        }
    }

    await activeBuffer.setCursorPosition(
        currentFileErrors[0].range.start.line,
        currentFileErrors[0].range.start.character,
    )
}

export const gotoPreviousError = async () => {
    const errors = getDiagnosticsInstance().getErrors()
    const activeBuffer = editorManager.activeEditor.activeBuffer
    const currentFileErrors = getAllErrorsForFile(activeBuffer.filePath, errors)
    const currentPosition = activeBuffer.cursor

    if (!currentFileErrors || !currentFileErrors.length) {
        return
    }

    let lastError = currentFileErrors[currentFileErrors.length - 1]
    for (const error of currentFileErrors) {
        if (
            isInRange(currentPosition.line, currentPosition.column, error.range) ||
            error.range.start.line > currentPosition.line ||
            (error.range.start.line === currentPosition.line &&
                error.range.start.character > currentPosition.column)
        ) {
            await activeBuffer.setCursorPosition(
                lastError.range.start.line,
                lastError.range.start.character,
            )
            return
        }
        lastError = error
    }

    await activeBuffer.setCursorPosition(
        lastError.range.start.line,
        lastError.range.start.character,
    )
}
