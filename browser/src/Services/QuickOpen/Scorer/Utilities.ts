/**
 * Assortment of imported Utility functions from VSCode
 */

import { CharCode } from "./CharCode"

export const isWindows = process.platform === "win32"
export const isMacintosh = process.platform === "darwin"
export const isLinux = process.platform === "linux"

// The native path separator depending on the OS.
export const nativeSep = isWindows ? "\\" : "/"

export function isLower(code: number): boolean {
    return CharCode.a <= code && code <= CharCode.z
}

export function isUpper(code: number): boolean {
    return CharCode.A <= code && code <= CharCode.Z
}

export function isNumber(code: number): boolean {
    return CharCode.Digit0 <= code && code <= CharCode.Digit9
}

export function isWhitespace(code: number): boolean {
    return (
        code === CharCode.Space ||
        code === CharCode.Tab ||
        code === CharCode.LineFeed ||
        code === CharCode.CarriageReturn
    )
}

export function isAlphanumeric(code: number): boolean {
    return isLower(code) || isUpper(code) || isNumber(code)
}

export function convertSimple2RegExpPattern(pattern: string): string {
    return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&").replace(/[\*]/g, ".*")
}

export function stripWildcards(pattern: string): string {
    return pattern.replace(/\*/g, "")
}
