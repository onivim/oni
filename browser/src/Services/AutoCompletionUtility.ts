/**
 * AutoCompletionUtility.ts
 *
 * Helper functions for auto completion
 */

export function getCompletionStart(bufferLine: string, cursorColumn: number, completion: string): number {

    cursorColumn = Math.min(cursorColumn, bufferLine.length)

    let x = cursorColumn - 1
    while (x >= 0) {

        const subWord = bufferLine.substring(x, cursorColumn)

        if (completion.indexOf(subWord) === -1) {
            break
        }

        x--
    }

    return x + 1
}

export function replacePrefixWithCompletion(bufferLine: string, cursorColumn: number, completion: string): string {
    const startPosition = getCompletionStart(bufferLine, cursorColumn, completion)

    const before = bufferLine.substring(0, startPosition)
    const after = bufferLine.substring(cursorColumn + 1, bufferLine.length)

    return before + completion + after
}
