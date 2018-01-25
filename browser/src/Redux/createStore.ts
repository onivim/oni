/*
 * createStore
 *
 * Common utilities for creating a redux store with Oni
 *
 * Implementations some common functionality, like:
 * - Logging
 * - Throttled subscriptions
 */

import {
    applyMiddleware,
    compose,
    createStore as reduxCreateStore,
    Middleware,
    Reducer,
    Store,
} from "redux"
import { batchedSubscribe } from "redux-batched-subscribe"

import { createLoggingMiddleware } from "./LoggingMiddleware"

import { RequestAnimationFrameNotifyBatcher } from "./RequestAnimationFrameNotifyBatcher"

export const createStore = <TState>(
    name: string,
    reducer: Reducer<TState>,
    defaultState: TState,
    optionalMiddleware: Middleware[] = [],
): Store<TState> => {
    // tslinst:disable-next-line no-string-literal
    const composeFunction: any = window["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"]

    const composeEnhancers =
        typeof window === "object" && composeFunction ? composeFunction({ name }) : compose // tslint:disable-line no-string-literal

    const loggingMiddleware: Middleware = createLoggingMiddleware(name)

    const middleware = [loggingMiddleware, ...optionalMiddleware]

    const enhancer = composeEnhancers(
        applyMiddleware(...middleware),
        batchedSubscribe(RequestAnimationFrameNotifyBatcher()),
    )
    return reduxCreateStore(reducer, defaultState, enhancer)
}
