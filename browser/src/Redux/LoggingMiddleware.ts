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
        console.dir(action) // tslint:disable-line
    }

    const result = next(action)

    if (Log.isDebugLoggingEnabled()) {
        Log.debug("[REDUX - " + storeName + "] New State: ")
        console.dir(store.getState()) // tslint:disable-line
    }

    return result
}
