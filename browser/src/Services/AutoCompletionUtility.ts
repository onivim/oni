/**
 * AutoCompletionUtility.ts
 *
 * Helper functions for auto completion
 */

export function getCompletionStart(bufferLine: string, cursorColumn: number, completion: string): number {

    cursorColumn = Math.min(cursorColumn, bufferLine.length)

    let x = cursorColumn
    while (x >= 0) {

        const subWord = bufferLine.substring(x, cursorColumn + 1)

        if (completion.indexOf(subWord) === -1) {
            break
        }

        x--
    }

    return x + 1
}

export function replacePrefixWithCompletion(bufferLine: string, basePosition: number, cursorColumn: number, completion: string): string {
    const startPosition = basePosition

    const before = bufferLine.substring(0, startPosition)
    const after = bufferLine.substring(cursorColumn, bufferLine.length)

    return before + completion + after
}

export interface CompletionMeetResult {
    position: number
    base: string
    shouldExpandCompletions: boolean
}

/**
 * Returns the start of the 'completion meet' along with the current base for completion
 */
export function getCompletionMeet(line: string, cursorColumn: number, characterMatchRegex: RegExp): CompletionMeetResult {

    // Clamp column to within string bands
    let col = Math.max(cursorColumn - 1, 0)
    col = Math.min(col, line.length - 1)

    let currentPrefix = ""

    while (col >= 0 && col < line.length) {
        const currentCharacter = line[col]

        if (!currentCharacter.match(characterMatchRegex)) {
            break
        }

        currentPrefix = currentCharacter + currentPrefix
        col--
    }

    const basePos = col

    const shouldExpandCompletions = currentPrefix.length > 0 || line[basePos] === "."

    // TODO: Refactor this into a 'trigger characters' array
    // if (currentPrefix.length === 0 && line[basePos] !== ".") {
    //     return null
    // } else {
    return {
        position: basePos + 1,
        base: currentPrefix,
        shouldExpandCompletions,
    }
    // }

}
