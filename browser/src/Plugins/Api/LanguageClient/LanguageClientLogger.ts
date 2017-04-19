/**
 * LanguageClientLogger.ts
 *
 * Helper utility for handling logging from language service clients
 */

export class LanguageClientLogger {
    public error(message: string): void {
        console.error(message)
    }

    public warn(message: string): void {
        console.warn(message)
    }

    public info(message: string): void {
        console.log(message) // tslint:disable-line no-console
    }

    public log(message: string): void {
        console.log(message) // tslint:disable-line no-console
    }
}
