/**
 * An assertion framework
 */

import * as stock_assert from "assert"

export class Assertor {
    private _lastSuccessIndex: number = 0

    constructor(private _testName: string) {}

    public contains(containing: string, contained: string, name: string): void {
        this.assert(
            containing.indexOf(contained) >= 0,
            `${name} expected to contain \`${contained}\`, but instead has only \`${containing}\``,
        )
    }

    public isEmpty(str: string, name: string): void {
        this.assert(
            str.length === 0,
            `${name} expected to be empty, instead it has \`${str}\` (${str.length} characters)`,
        )
    }

    public defined(obj: any, name: string): void {
        if (obj === null) {
            this.failed(`${name} is null`)
        } else if (obj === undefined) {
            this.failed(`${name} is undefined`)
        } else {
            this._lastSuccessIndex += 1
        }
    }

    /**
     * A temporary solution that works around the issue that assert doesn't print the error
     */
    public assert(condition: boolean, message: string): void {
        if (condition) {
            this._lastSuccessIndex += 1
        } else {
            this.failed(message)
        }
    }

    private failed(message: string): void {
        const index = this._lastSuccessIndex + 1
        const messagePrefix = `[${this._testName}] Assertion #${index}: `
        console.error(messagePrefix + message) // tslint:disable-line no-console
        stock_assert(false, message)
    }
}
