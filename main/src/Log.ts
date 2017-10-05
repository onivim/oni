/**
 * Log.ts
 *
 * Log helper methods for the main process
 */

const logs = []

const isVerbose = process.argv.filter(arg => arg.indexOf("--verbose") >= 0).length > 0

export const info = (msg: string): void => {
    if (isVerbose) {
        console.log(msg) // tslint:disable-line no-console
    }

    logs.push(msg)
}

export const warn = (msg: string): void => {
    if (isVerbose) {
        console.warn(msg) // tslint:disable-line no-console
    }

    logs.push(msg)
}

export const getAllLogs = () => {
    return logs
}
