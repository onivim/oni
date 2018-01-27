import * as types from "vscode-languageserver-types"

import { IServerCapabilities } from "./ServerCapabilities"

export type NotificationFunction = (capabilities: IServerCapabilities) => any
export type NotificationFunctionWithPromise = (capabilities: IServerCapabilities) => Promise<any>
export type NotificationValueOrThunk = NotificationFunction | NotificationFunctionWithPromise | any

export type RequestHandler = (payload: any) => Promise<any>

export interface IResultWithPosition<T> {
    result: T
    position: types.Position
}

export const unwrapThunkOrValue = (val: NotificationValueOrThunk, args: any): Promise<any> => {
    if (typeof val !== "function") {
        return Promise.resolve(val)
    } else {
        const returnValue = val(args)
        if (typeof returnValue.then === "function") {
            return Promise.resolve(returnValue)
        } else {
            return returnValue
        }
    }
}
