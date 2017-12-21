/*
 * LoggingMiddleware
 *
 * Logging strategy for Redux, specific to Oni
 */

import { Store } from "redux"

import * as Log from "./../Log"

export const createLoggingMiddleware = (storeName: string) => (store: Store<any>) => (next: any) => (action: any): any => {
    Log.verbose("[REDUX - " + storeName + "][ACTION] " + action.type)

    const result = next(action)

    return result
}
