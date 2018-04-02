/**
 * Imported functions from VSCode's strings.ts
 */

import { CharCode } from "./CharCode"

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
