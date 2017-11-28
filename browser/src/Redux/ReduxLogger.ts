/*
 * createStore
 *
 * Common utilities for creating a redux store with Oni
 *
 * Implementations some common functionality, like:
 * - Logging
 * - Throttled subscriptions
 */

import { applyMiddleware, compose, createStore as reduxCreateStore, Middleware, Reducer, Store } from "redux"
import { batchedSubscribe } from "redux-batched-subscribe"

import { RequestAnimationFrameNotifyBatcher } from "./RequestAnimationFrameNotifyBatcher"

export const createStore = <TState>(name: string, reducer: Reducer<TState>, defaultState: TState, optionalMiddleware: Middleware[] = []): Store<TState> => {

    const composeEnhancers = window["__REDUX_DEVTOOLS_EXTENSION__COMPOSE__"] || compose // tslint:disable-line no-string-literal
    const enhancer = composeEnhancers(
        applyMiddleware(...optionalMiddleware),
        batchedSubscribe(RequestAnimationFrameNotifyBatcher),
    )
    return reduxCreateStore(reducer, defaultState, enhancer)
}
