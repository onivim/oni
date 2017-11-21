/**
 * Automation.ts
 *
 * Helper methods for running automated tests
 */

import * as OniApi from "oni-api"

import * as Utility from "./../Utility"

import { editorManager } from "./EditorManager"
import { inputManager } from "./InputManager"

export interface ITestResult {
    passed: boolean
    exception?: any
}

import { Oni } from "./../Plugins/Api/Oni"

export class Automation implements OniApi.Automation.Api {

    public sendKeys(keys: string): void {

        if (!inputManager.handleKey(keys)) {
            const anyEditor: any = editorManager.activeEditor as any
            anyEditor._onKeyDown(keys)
        }
    }

    public async sleep(time: number = 1000): Promise<void> {
        return new Promise<void>((r) => window.setTimeout(() => r(), time))
    }

    public async waitFor(condition: () => boolean, timeout: number = 5000): Promise<void> {
        let time = 0
        const interval = 1000

        while (time <= timeout) {
            if (condition()) {
                return
            }
            await this.sleep(interval)
            time += interval
        }

        throw new Error("waitFor: Timeout expired")
    }

    public async runTest(testPath: string): Promise<void> {
        const containerElement = this._getOrCreateTestContainer()
        containerElement.innerHTML = ""

        const testPath2 = testPath

        try {
            const testCase: any = Utility.nodeRequire(testPath2)
            await testCase.test(new Oni())
            this._reportResult(true)
        } catch (ex) {
            this._reportResult(false, ex)
        }
    }

    private _getOrCreateTestContainer(): HTMLDivElement {
        const containerElement = document.body.getElementsByClassName("automated-test-container")

        if (containerElement && containerElement.length > 0) {
            return containerElement[0] as HTMLDivElement
        }

        const container = this._createElement("automated-test-container", document.body)
        return container
    }

    private _reportResult(passed: boolean, exception?: any): void {
        const resultElement = this._createElement("automated-test-result", this._getOrCreateTestContainer())

        resultElement.textContent = JSON.stringify({
            passed,
            exception: exception || null,
        })
    }

    private _createElement(className: string, parentElement: HTMLElement): HTMLDivElement {
        const elem = document.createElement("div")
        elem.className = className
        parentElement.appendChild(elem)
        return elem
    }
}

export const automation = new Automation()
