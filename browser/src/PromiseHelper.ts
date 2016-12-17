
import * as Q from "q"

import * as Performance from "./Performance"

/**
 * Thin wrapper around browser performance API
 */
export function wrapPromiseAndNotifyError<T>(operationName: string, promise: Q.Promise<T>): void {
    Performance.mark(operationName + ".start")

    promise.then(() => {
        Performance.mark(operationName + ".end")
    }, (err: Error) => {
        Performance.mark(operationName + ".end")

        // TODO: We'll need to handle this differently eventually
        // Potentially with a more fully-baked notification / error system (#98)
        alert(`Error: ${err}`)
    })
}
