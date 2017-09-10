/**
 * Log.ts
 *
 * Utilities for logging in Oni
 */

export function debug(message: string): void {
    console.log(message) // tslint:disable-line no-console
}

export function info(message: string): void {
    console.log(message) // tslint:disable-line no-console
}

export function warn(message: string): void {
    console.warn(message) // tslint:disable-line no-console
}

export function error(messageOrError: string | Error, errorDetails?: any): void {
    console.error(messageOrError) // tslint:disable-line no-console
}
