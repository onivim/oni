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
    // Position - where the meet starts
    position: number

    // PositionToQuery - where the query request should start
    positionToQuery: number

    // Base - the currentg prefix of the completion
    base: string

    // Whether or not completiosn should be expanded / queriried
    shouldExpandCompletions: boolean
}

export const doesCharacterMatchTriggerCharacters = (character: string, triggerCharacters: string[]): boolean => {
    return triggerCharacters.indexOf(character) >= 0
}

/**
 * Returns the start of the 'completion meet' along with the current base for completion
 */
export function getCompletionMeet(line: string, cursorColumn: number, characterMatchRegex: RegExp, completionTriggerCharacters: string[]): CompletionMeetResult {

    // Clamp column to within string bands
    let col = Math.max(cursorColumn - 1, 0)
    col = Math.min(col, line.length - 1)

    let currentPrefix = ""

    while (col >= 0 && col < line.length) {
        const currentCharacter = line[col]

        if (!currentCharacter.match(characterMatchRegex) || doesCharacterMatchTriggerCharacters(currentCharacter, completionTriggerCharacters)) {
            break
        }

        currentPrefix = currentCharacter + currentPrefix
        col--
    }

    const basePos = col + 1

    const isFromTriggerCharacter = doesCharacterMatchTriggerCharacters(line[basePos - 1], completionTriggerCharacters)

    const shouldExpandCompletions = currentPrefix.length > 0 || isFromTriggerCharacter

    const positionToQuery = isFromTriggerCharacter ? basePos : basePos + 1

    return {
        position: basePos,
        positionToQuery,
        base: currentPrefix,
        shouldExpandCompletions,
    }
}
