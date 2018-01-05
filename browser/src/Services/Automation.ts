/**
 * Automation.ts
 *
 * Helper methods for running automated tests
 */

import { remote } from "electron"

import * as OniApi from "oni-api"

import * as Utility from "./../Utility"

import { configuration } from "./Configuration"
import { editorManager } from "./EditorManager"
import { inputManager } from "./InputManager"

import * as Log from "./../Log"
import * as Shell from "./../UI/Shell"

export interface ITestResult {
    passed: boolean
    exception?: any
}

import { Oni } from "./../Plugins/Api/Oni"

export class Automation implements OniApi.Automation.Api {

    public sendKeys(keys: string): void {
        Log.info("[AUTOMATION] Sending keys: " + keys)

        if (!inputManager.handleKey(keys)) {
            Log.info("[AUTOMATION] InputManager did not handle key: " + keys)
            const anyEditor: any = editorManager.activeEditor as any
            anyEditor._onKeyDown(keys)
        }
    }

    public async sleep(time: number = 1000): Promise<void> {
        Log.info("[AUTOMATION] Sleeping for " + time + "ms")
        return new Promise<void>((r) => window.setTimeout(() => r(), time))
    }

    public async waitFor(condition: () => boolean, timeout: number = 10000): Promise<void> {
        Log.info("[AUTOMATION] Starting wait - limit: " + timeout)
        let time = 0
        const interval = 1000

        while (time <= timeout) {
            if (condition()) {
                Log.info("[AUTOMATION] Wait condition met at: " + time)
                return
            }
            await this.sleep(interval)
            time += interval
            Log.info("[AUTOMATION] Wait condition still not met: " + time + " / " + timeout)
        }

        Log.info("[AUTOMATION]: waitFor timeout expired")

        throw new Error("waitFor: Timeout expired")
    }

    public async waitForEditors(): Promise<void> {
        // Add explicit wait for Neovim to be initialized
        // The CI machines can often be slow, so we need a longer timout for it
        // TODO: Replace with a more explicit condition, once our startup
        // path is well-defined (#89, #355, #372)

        // Add explicit wait for Neovim to be initialized
        // The CI machines can often be slow, so we need a longer timout for it
        // TODO: Replace with a more explicit condition, once our startup
        // path is well-defined (#89, #355, #372)
        Log.info("[AUTOMATION] Waiting for startup...")
        await this.waitFor(() => (Shell.store.getState() as any).isLoaded, 30000)
        Log.info("[AUTOMATION] Startup complete!")

        Log.info("[AUTOMATION] Waiting for neovim to attach...")
        await this.waitFor(() => editorManager.activeEditor.neovim && (editorManager.activeEditor as any).neovim.isInitialized, 30000)
        Log.info("[AUTOMATION] Neovim attached!")
    }

    public async runTest(testPath: string): Promise<void> {
        const containerElement = this._getOrCreateTestContainer("automated-test-container")
        containerElement.innerHTML = ""

        const testPath2 = testPath

        Log.enableVerboseLogging()
        try {
            Log.info("[AUTOMATION] Starting test: " + testPath)
            Log.info("[AUTOMATION] Configuration path: " + configuration.userJsConfig)
            const testCase: any = Utility.nodeRequire(testPath2)
            const oni = new Oni()

            this._initializeBrowseWindow()

            await testCase.test(oni)
            Log.info("[AUTOMATION] Completed test: " + testPath)
            this._reportResult(true)
        } catch (ex) {
            this._reportResult(false, ex)
        } finally {
            this._reportWindowSize()
        }
    }

    private _initializeBrowseWindow(): void {
        const win = remote.getCurrentWindow()
        win.maximize()
        win.focus()

        this._reportWindowSize()
    }

    private _reportWindowSize(): void {
        const win = remote.getCurrentWindow()
        const size = win.getContentSize()
        Log.info(`[AUTOMATION]: Window size reported as ${size}`)
        Log.info(`[AUTOMATION]: Window focus state: ${win.isFocused()}`)
        Log.info(`[AUTOMATION]: Is off-screen rendering: ${win.webContents.isOffscreen()}`)
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
