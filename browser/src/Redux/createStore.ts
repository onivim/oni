/*
 * createStore
 *
 * Common utilities for creating a redux store with Oni
 *
 * Implementations some common functionality, like:
 * - Logging
 * - Throttled subscriptions
 */


import { applyMiddleware, createStore as reduxCreateStore, Middleware, Reducer, Store } from "redux"

export const createStore = <TState>(name: string, reducer: Reducer<TState>, optionalMiddleware: Middleware[] = []): Store<TState> => {

    const mdw = applyMiddleware(...optionalMiddleware)

    return reduxCreateStore(reducer, mdw)
}
