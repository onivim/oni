/**
 * Log.ts
 *
 * Log helper methods for the main process
 */

export const info = (msg: string): void => {
    console.log(msg) // tslint:disable-line no-console
}

export const warn = (msg: string): void => {
    console.warn(msg) // tslint:disable-line no-console
}
