/**
 * LanguageClientLogger.ts
 *
 * Helper utility for handling logging from language service clients
 */

import * as Log from "oni-core-logging"

export class LanguageClientLogger {
    public error(message: string): void {
        Log.error(message)
    }

    public warn(message: string): void {
        Log.warn(message)
    }

    public info(message: string): void {
        Log.info(message)
    }

    public log(message: string): void {
        Log.info(message)
    }
}
