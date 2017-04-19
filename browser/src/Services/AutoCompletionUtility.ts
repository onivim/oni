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

export interface CompletionMeetResult {
    position: number
    base: string
}

/**
 * Returns the start of the 'completion meet' along with the current base for completion
 */
export function getCompletionMeet(line: string, cursorColumn: number, characterMatchRegex: RegExp): CompletionMeetResult {

    if (cursorColumn <= 1) {
        return null
    }

    let col = cursorColumn - 2
    let currentPrefix = ""

    while (col >= 0) {
        const currentCharacter = line[col]

        if (!currentCharacter.match(characterMatchRegex)) {
            break
        }

        currentPrefix = currentCharacter + currentPrefix
        col--
    }

    const basePos = col

    // TODO: Refactor this into a 'trigger characters' array
    if (currentPrefix.length === 0 && line[basePos] !== ".") {
        return null
    } else {
        return {
            position: basePos,
            base: currentPrefix,
        }
    }

}
