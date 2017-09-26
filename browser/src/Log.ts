/**
 * Log.ts
 *
 * Utilities for logging in Oni
 */

// For now, `isVerboseLoggingEnabled` will handle both `debug` and `verbose` levels.
// (and on by default for development builds)
let isVerboseLoggingEnabled = process.env["NODE_ENV"] === "development" // tslint:disable-line no-string-literal

export const debug = (message: string): void => {
    if (isVerboseLoggingEnabled) {
        console.log(message) // tslint:disable-line no-console
    }
}

export const verbose = (message: string): void => {
    if (isVerboseLoggingEnabled) {
        console.log(message) // tslint:disable-line no-console
    }
}

export const info = (message: string): void  => {
    console.log(message) // tslint:disable-line no-console
}

export const warn = (message: string): void  => {
    console.warn(message) // tslint:disable-line no-console
}

export const error = (messageOrError: string | Error, errorDetails?: any): void => {
    console.error(messageOrError) // tslint:disable-line no-console
}

export const enableVerboseLogging = () => {
    isVerboseLoggingEnabled = true
}

export const disableVerboseLogging = () => {
    isVerboseLoggingEnabled = false
}
