/**
 * Automation.ts
 *
 * Helper methods for running automated tests
 */

import * as OniApi from "oni-api"

import * as Utility from "./../Utility"

import { editorManager } from "./EditorManager"
import { inputManager } from "./InputManager"

import * as Log from "./../Log"

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
        const containerElement = this._getOrCreateTestContainer("automated-test-container")
        containerElement.innerHTML = ""

        const testPath2 = testPath

        const loggingRedirector = new LoggingRedirector()
        Log.enableDebugLogging()
        try {
            const testCase: any = Utility.nodeRequire(testPath2)
            await testCase.test(new Oni())
            this._reportResult(true)
        } catch (ex) {
            this._reportResult(false, ex)
        } finally {
            const logs = loggingRedirector.getAllLogs()

            const logsElement = this._createElement("automated-test-logs", this._getOrCreateTestContainer("automated-test-container"))

            logsElement.textContent = JSON.stringify(logs)

            loggingRedirector.dispose()
        }
    }

    private _getOrCreateTestContainer(className: string): HTMLDivElement {
        const containerElement = document.body.getElementsByClassName(className)

        if (containerElement && containerElement.length > 0) {
            return containerElement[0] as HTMLDivElement
        }

        const container = this._createElement(className, document.body)
        return container
    }

    private _reportResult(passed: boolean, exception?: any): void {
        const resultElement = this._createElement("automated-test-result", this._getOrCreateTestContainer("automated-test-container"))

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

class LoggingRedirector {

    private _logs: string[] = []

    private _oldInfo: any
    private _oldWarn: any
    private _oldError: any

    constructor() {
        this._oldInfo = console.log
        this._oldWarn = console.warn
        this._oldError = console.error

        console.log = this._redirect("INFO", this._oldInfo)
        console.warn = this._redirect("WARN", this._oldWarn)
        console.error = this._redirect("ERROR", this._oldError)
    }

    public getAllLogs(): string[] {
        return this._logs
    }

    public dispose(): void {
        this._logs = null

        console.log = this._oldInfo
        console.warn = this._oldWarn
        console.error = this._oldError

        this._oldInfo = null
        this._oldWarn = null
        this._oldError = null
    }

    private _redirect(type: string, oldFunction: any): any {
        return (...args: any[]) => {
            this._logs.push("[" + type + "][" + new Date().getTime() + "]: " + JSON.stringify(args))
            oldFunction(args)
        }
    }
}
