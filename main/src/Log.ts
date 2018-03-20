/**
 * Log.ts
 *
 * Log helper methods for the main process
 */

const logs = []

let _isVerbose = false

const isVerbose = () =>
    process.argv.filter(arg => arg.indexOf("--verbose") >= 0).length > 0 || _isVerbose

export const setVerbose = (verbose: boolean) => {
    _isVerbose = verbose
}

export const info = (msg: string): void => {
    if (isVerbose()) {
        console.log(msg) // tslint:disable-line no-console
    }

    logs.push(msg)
}

export const warn = (msg: string): void => {
    if (isVerbose()) {
        console.warn(msg) // tslint:disable-line no-console
    }

    logs.push(msg)
}

export const getAllLogs = () => {
    return logs
}
