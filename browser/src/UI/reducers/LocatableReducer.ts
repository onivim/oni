/**
 * LocatableReducer.ts
 *
 * Helper higher-order reducer to manage 'locatable' state
 * (state associated with a particular file, line, and column)
 */

import * as State from "./../State"

export function locatableHigherOrderReducer<T>(innerReducer: (s: T, a: any) => T) {
    return (s: State.ILocatable<T>, a: any) => {

        // Check if state changed...
        const previousState = (s && s.data) ? s.data : null
        const newState = innerReducer(previousState, a)

        if (newState === previousState) {
            return s
        } else {
            // Otherwise, apply the location data as well
            const { filePath, line, column } = a.payload

            return {
                filePath,
                line,
                column,
                data: newState
            }
        }
    }
}
