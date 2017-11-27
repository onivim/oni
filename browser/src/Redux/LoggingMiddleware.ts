/*
 * LoggingMiddleware
 *
 * Logging strategy for Redux, specific to Oni
 */


import { Store } from "redux"

import * as Log from "./../Log"

export const createLoggingMiddleware = (storeName: string) => (store: Store<any>) => (next: any) => (action: any): any => {
    Log.verbose("[REDUX - " + storeName + "] Applying action - " + action.type + ":")

    if (Log.isDebugLoggingEnabled()) {
        console.dir(action)
    }

    const result = next(action)

    if (Log.isDebugLoggingEnabled()) {
        console.log("[REDUX - " + storeName + "] New State: ")
        console.dir(store.getState())
    }

    return result
}
