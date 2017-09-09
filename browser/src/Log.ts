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

export function error(message: string, errorDetails?: any): void {
    console.error(message, errorDetails) // tslint:disable-line no-console
}
