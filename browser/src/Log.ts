/**
 * Log.ts
 *
 * Utilities for logging in Oni
 */

import * as UI from "./UI/index"

export function info(message: string): void {
    UI.Actions.makeLog({
        type: "info",
        message,
        details: null
    })

    console.log(message) // tslint:disable-line no-console
}
