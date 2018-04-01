import { CharCode } from "./CharCode"

export const isWindows = process.platform === "win32"
export const isMacintosh = process.platform === "darwin"
export const isLinux = process.platform === "linux"

// The native path separator depending on the OS.
export const nativeSep = isWindows ? "\\" : "/"

export interface IFilter {
    // Returns null if word doesn't match.
    (word: string, wordToMatchAgainst: string): IMatch[]
}

export interface IMatch {
    start: number
    end: number
}

export const matchesPrefix: IFilter = _matchesPrefix.bind(undefined, true)

function _matchesPrefix(ignoreCase: boolean, word: string, wordToMatchAgainst: string): IMatch[] {
    if (!wordToMatchAgainst || wordToMatchAgainst.length < word.length) {
        return null
    }

    let matches: boolean
    if (ignoreCase) {
        matches = startsWithIgnoreCase(wordToMatchAgainst, word)
    } else {
        matches = wordToMatchAgainst.indexOf(word) === 0
    }

    if (!matches) {
        return null
    }

    return word.length > 0 ? [{ start: 0, end: word.length }] : []
}

function isLower(code: number): boolean {
    return CharCode.a <= code && code <= CharCode.z
}

export function isUpper(code: number): boolean {
    return CharCode.A <= code && code <= CharCode.Z
}

function isNumber(code: number): boolean {
    return CharCode.Digit0 <= code && code <= CharCode.Digit9
}

function isWhitespace(code: number): boolean {
    return (
        code === CharCode.Space ||
        code === CharCode.Tab ||
        code === CharCode.LineFeed ||
        code === CharCode.CarriageReturn
    )
}

function isAlphanumeric(code: number): boolean {
    return isLower(code) || isUpper(code) || isNumber(code)
}

export function stripWildcards(pattern: string): string {
    return pattern.replace(/\*/g, "")
}

function isLowerAsciiLetter(code: number): boolean {
    return code >= CharCode.a && code <= CharCode.z
}

function isUpperAsciiLetter(code: number): boolean {
    return code >= CharCode.A && code <= CharCode.Z
}

function isAsciiLetter(code: number): boolean {
    return isLowerAsciiLetter(code) || isUpperAsciiLetter(code)
}

export function equalsIgnoreCase(a: string, b: string): boolean {
    const len1 = a ? a.length : 0
    const len2 = b ? b.length : 0

    if (len1 !== len2) {
        return false
    }

    return doEqualsIgnoreCase(a, b)
}

function doEqualsIgnoreCase(a: string, b: string, stopAt = a.length): boolean {
    if (typeof a !== "string" || typeof b !== "string") {
        return false
    }

    for (let i = 0; i < stopAt; i++) {
        const codeA = a.charCodeAt(i)
        const codeB = b.charCodeAt(i)

        if (codeA === codeB) {
            continue
        }

        // a-z A-Z
        if (isAsciiLetter(codeA) && isAsciiLetter(codeB)) {
            let diff = Math.abs(codeA - codeB)
            if (diff !== 0 && diff !== 32) {
                return false
            }
        } else {
            // Any other charcode
            if (
                String.fromCharCode(codeA).toLowerCase() !==
                String.fromCharCode(codeB).toLowerCase()
            ) {
                return false
            }
        }
    }

    return true
}

export function startsWithIgnoreCase(str: string, candidate: string): boolean {
    const candidateLength = candidate.length
    if (candidate.length > str.length) {
        return false
    }

    return doEqualsIgnoreCase(str, candidate, candidateLength)
}

export function createMatches(position: number[]): IMatch[] {
    let ret: IMatch[] = []
    if (!position) {
        return ret
    }
    let last: IMatch
    for (const pos of position) {
        if (last && last.end === pos) {
            last.end += 1
        } else {
            last = { start: pos, end: pos + 1 }
            ret.push(last)
        }
    }
    return ret
}

function nextAnchor(camelCaseWord: string, start: number): number {
    for (let i = start; i < camelCaseWord.length; i++) {
        let c = camelCaseWord.charCodeAt(i)
        if (
            isUpper(c) ||
            isNumber(c) ||
            (i > 0 && !isAlphanumeric(camelCaseWord.charCodeAt(i - 1)))
        ) {
            return i
        }
    }
    return camelCaseWord.length
}

function _matchesCamelCase(word: string, camelCaseWord: string, i: number, j: number): IMatch[] {
    if (i === word.length) {
        return []
    } else if (j === camelCaseWord.length) {
        return null
    } else if (word[i] !== camelCaseWord[j].toLowerCase()) {
        return null
    } else {
        let result: IMatch[] = null
        let nextUpperIndex = j + 1
        result = _matchesCamelCase(word, camelCaseWord, i + 1, j + 1)
        while (
            !result &&
            (nextUpperIndex = nextAnchor(camelCaseWord, nextUpperIndex)) < camelCaseWord.length
        ) {
            result = _matchesCamelCase(word, camelCaseWord, i + 1, nextUpperIndex)
            nextUpperIndex++
        }
        return result === null ? null : join({ start: j, end: j + 1 }, result)
    }
}

interface ICamelCaseAnalysis {
    upperPercent: number
    lowerPercent: number
    alphaPercent: number
    numericPercent: number
}

// Heuristic to avoid computing camel case matcher for words that don't
// look like camelCaseWords.
function analyzeCamelCaseWord(word: string): ICamelCaseAnalysis {
    let upper = 0,
        lower = 0,
        alpha = 0,
        numeric = 0,
        code = 0

    for (let i = 0; i < word.length; i++) {
        code = word.charCodeAt(i)

        if (isUpper(code)) {
            upper++
        }
        if (isLower(code)) {
            lower++
        }
        if (isAlphanumeric(code)) {
            alpha++
        }
        if (isNumber(code)) {
            numeric++
        }
    }

    let upperPercent = upper / word.length
    let lowerPercent = lower / word.length
    let alphaPercent = alpha / word.length
    let numericPercent = numeric / word.length

    return { upperPercent, lowerPercent, alphaPercent, numericPercent }
}

function isUpperCaseWord(analysis: ICamelCaseAnalysis): boolean {
    const { upperPercent, lowerPercent } = analysis
    return lowerPercent === 0 && upperPercent > 0.6
}

function isCamelCaseWord(analysis: ICamelCaseAnalysis): boolean {
    const { upperPercent, lowerPercent, alphaPercent, numericPercent } = analysis
    return lowerPercent > 0.2 && upperPercent < 0.8 && alphaPercent > 0.6 && numericPercent < 0.2
}

// Heuristic to avoid computing camel case matcher for words that don't
// look like camel case patterns.
function isCamelCasePattern(word: string): boolean {
    let upper = 0,
        lower = 0,
        code = 0,
        whitespace = 0

    for (let i = 0; i < word.length; i++) {
        code = word.charCodeAt(i)

        if (isUpper(code)) {
            upper++
        }
        if (isLower(code)) {
            lower++
        }
        if (isWhitespace(code)) {
            whitespace++
        }
    }

    if ((upper === 0 || lower === 0) && whitespace === 0) {
        return word.length <= 30
    } else {
        return upper <= 5
    }
}

export function matchesCamelCase(word: string, camelCaseWord: string): IMatch[] {
    if (!camelCaseWord) {
        return null
    }

    camelCaseWord = camelCaseWord.trim()

    if (camelCaseWord.length === 0) {
        return null
    }

    if (!isCamelCasePattern(word)) {
        return null
    }

    if (camelCaseWord.length > 60) {
        return null
    }

    const analysis = analyzeCamelCaseWord(camelCaseWord)

    if (!isCamelCaseWord(analysis)) {
        if (!isUpperCaseWord(analysis)) {
            return null
        }

        camelCaseWord = camelCaseWord.toLowerCase()
    }

    let result: IMatch[] = null
    let i = 0

    while (
        i < camelCaseWord.length &&
        (result = _matchesCamelCase(word.toLowerCase(), camelCaseWord, 0, i)) === null
    ) {
        i = nextAnchor(camelCaseWord, i + 1)
    }

    return result
}

function join(head: IMatch, tail: IMatch[]): IMatch[] {
    if (tail.length === 0) {
        tail = [head]
    } else if (head.end === tail[0].start) {
        tail[0].start = head.start
    } else {
        tail.unshift(head)
    }
    return tail
}
