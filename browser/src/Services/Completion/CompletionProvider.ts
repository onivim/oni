/**
 * Completion.ts
 */

import { editorManager } from "./../EditorManager"

import * as CompletionUtility from "./CompletionUtility"

export const commitCompletion = async (line: number, base: number, completion: string) => {
    const buffer = editorManager.activeEditor.activeBuffer
    const currentLines = await buffer.getLines(line, line + 1)

    const column = buffer.cursor.column

    if (!currentLines || !currentLines.length) {
        return
    }

    const originalLine = currentLines[0]

    const newLine = CompletionUtility.replacePrefixWithCompletion(originalLine, base, column, completion)
    await buffer.setLines(line, line + 1, [newLine])
    const cursorOffset = newLine.length - originalLine.length
    await buffer.setCursorPosition(line, column + cursorOffset)
}
