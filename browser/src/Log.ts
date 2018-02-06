/**
 * Log.ts
 *
 * Utilities for logging in Oni
 */

// Log levels are the same as `npm`:
// - error
// - warn
// - info
// - verbose
// - debug

// Debug is not enabled unless explicitly opted in via `enableDebugLogging` (can be executed in the console via `Oni.log.enableDebugLogging()`)
// Verbose is enabled for debug builds, and off for production builds

let verboseLoggingEnabled = process.env["NODE_ENV"] === "development" // tslint:disable-line no-string-literal
let debugLoggingEnabled = false

export const debug = (message: string): void => {
    if (debugLoggingEnabled) {
        console.log(message) // tslint:disable-line no-console
    }
}

export const verbose = (message: string): void => {
    if (verboseLoggingEnabled || debugLoggingEnabled) {
        console.log(message) // tslint:disable-line no-console
    }
}

export const info = (message: string): void => {
    console.log(message) // tslint:disable-line no-console
}

export const warn = (message: string): void => {
    console.warn(message) // tslint:disable-line no-console
}

export const error = (messageOrError: string | Error, errorDetails?: any): void => {
    console.error(messageOrError) // tslint:disable-line no-console
}

export const isDebugLoggingEnabled = () => debugLoggingEnabled
export const isVerboseLoggingEnabled = () => verboseLoggingEnabled

export const enableDebugLogging = () => {
    debugLoggingEnabled = true
}

export const disableDebugLogging = () => {
    debugLoggingEnabled = false
}

export const enableVerboseLogging = () => {
    verboseLoggingEnabled = true
}

export const disableVerboseLogging = () => {
    verboseLoggingEnabled = false
}
