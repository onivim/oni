/**
 * TestHelpers.ts
 *
 * Set of utilities to assist with testing. Shim around some of the utilities we hook up in `testHelpers.js`
 */

/**
 * runAllTimers executes all pending clocks - including intervals, timeouts, and requestAnimationFrames
 */
export const runAllTimers = (): void => {
    global["clock"].runAll() // tslint:disable-line
}

/**
 * Wait for pending promise calls - needed for any code paths that have an asynchronous timer or use `Promise.resolve`
 */
export const waitForPromiseResolution = async (): Promise<void> => {
    await global["waitForPromiseResolution"]() // tslint:disable-line
}

export const waitForAllAsyncOperations = async (): Promise<void> => {
    await waitForPromiseResolution()
    runAllTimers()
}

import * as os from "os"

export const getRootDirectory = (): string => {
    const top = os.platform() === "win32" ? "C:/" : "/top"
    return top
}
