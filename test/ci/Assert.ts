/**
 * An assertion framework
 */

import * as stock_assert from "assert"

export class Assertor {
    private _lastSuccessIndex: number = 0

    constructor(private _testName: string, private _oni: any = null) {}

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

    public async waitFor(
        getData: () => any,
        action: (data: any) => boolean,
        timeout: number = 10000,
    ) {
        const SLEEP_TIME = 50
        let slept = 0
        do {
            await this._oni.automation.sleep(SLEEP_TIME)
            slept += SLEEP_TIME
        } while (slept < timeout && !action(getData()))

        const data = getData()
        this.assert(action(data), `timed out with "${data}" after ${slept}ms`)
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

    public equal(o1: any, o2: any): void {
        if (o1 === o2) {
            this._lastSuccessIndex += 1
        } else {
            this.failed(`${o1} !== ${o2}`)
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
