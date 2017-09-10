/**
 * Log.ts
 *
 * Log helper methods for the main process
 */

const logs = []

export const info = (msg: string): void => {
    console.log(msg) // tslint:disable-line no-console

    logs.push(msg)
}

export const warn = (msg: string): void => {
    console.warn(msg) // tslint:disable-line no-console

    logs.push(msg)
}

export const getAllLogs = () => {
    return logs
}
