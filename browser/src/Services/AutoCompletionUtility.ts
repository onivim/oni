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

    const basePos = col

    const isFromTriggerCharacter = doesCharacterMatchTriggerCharacters(line[basePos], completionTriggerCharacters)

    const shouldExpandCompletions = currentPrefix.length > 0 || isFromTriggerCharacter

    // If the expansion is due to a letter, start the match at the letter position
    const position = isFromTriggerCharacter ? basePos : basePos + 1

    return {
        position: position + 1,
        base: currentPrefix,
        shouldExpandCompletions,
    }
}
