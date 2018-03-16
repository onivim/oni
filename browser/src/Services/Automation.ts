/**
 * Automation.ts
 *
 * Helper methods for running automated tests
 */

import { remote } from "electron"

import * as OniApi from "oni-api"

import * as App from "./../App"
import * as Utility from "./../Utility"

import { getInstance as getSharedNeovimInstance } from "./../neovim/SharedNeovimInstance"
import { getUserConfigFilePath } from "./Configuration"
import { editorManager } from "./EditorManager"
import { inputManager } from "./InputManager"

import * as Log from "./../Log"
import * as Shell from "./../UI/Shell"

import { IKey, parseKeysFromVimString } from "./../Input/KeyParser"

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
            anyEditor.input(keys)
        }
    }

    public sendKeysV2(keys: string): void {
        const parsedKeys = parseKeysFromVimString(keys)

        const contents = remote.getCurrentWebContents()

        const convertCharacter = (key: string) => {
            switch (key.toLowerCase()) {
                case "lt":
                    return "<"
                case "cr":
                    return "enter"
                default:
                    return key
            }
        }

        const convertModifiers = (key: IKey): string[] => {
            const ret: string[] = []

            if (key.control) {
                ret.push("control")
            }
            if (key.alt) {
                ret.push("alt")
            }
            if (key.meta) {
                ret.push("meta")
            }
            if (key.shift) {
                ret.push("shift")
            }

            return ret
        }

        parsedKeys.chord.forEach(key => {
            const character = convertCharacter(key.character)
            const modifiers = convertModifiers(key)
            contents.sendInputEvent({ keyCode: character, modifiers, type: "keyDown" } as any)
            contents.sendInputEvent({ keyCode: character, modifiers, type: "char" } as any)
            contents.sendInputEvent({ keyCode: character, type: "keyUp" } as any)
        })
    }

    public async sleep(time: number = 1000): Promise<void> {
        Log.info("[AUTOMATION] Sleeping for " + time + "ms")
        return new Promise<void>(r => window.setTimeout(() => r(), time))
    }

    public async waitFor(condition: () => boolean, timeout: number = 10000): Promise<void> {
        Log.info(
            "[AUTOMATION] Starting wait - limit: " +
                timeout +
                " condition: " +
                condition.toString(),
        )
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

        Log.info("[AUTOMATION]: waitFor timeout expired for condition: " + condition.toString())

        throw new Error("waitFor: Timeout expired")
    }

    public async waitForEditors(): Promise<void> {
        Log.info("[AUTOMATION] Waiting for startup...")
        await App.waitForStart()
        Log.info("[AUTOMATION] Startup complete!")
    }

    public async runTest(testPath: string): Promise<void> {
        const containerElement = this._getOrCreateTestContainer("automated-test-container")
        containerElement.innerHTML = ""

        const testPath2 = testPath

        Log.enableVerboseLogging()
        try {
            Log.info("[AUTOMATION] Starting test: " + testPath)
            Log.info("[AUTOMATION] Configuration path: " + getUserConfigFilePath())
            const testCase: any = Utility.nodeRequire(testPath2)
            const oni = new Oni()

            this._initializeBrowseWindow()

            await testCase.test(oni)
            Log.info("[AUTOMATION] Completed test: " + testPath)

            await this._reportResult(true)
        } catch (ex) {
            await this._reportResult(false, ex)
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

    private async _reportResult(passed: boolean, exception?: any): Promise<void> {
        Log.info("[AUTOMATION] Quitting...")
        // Close all Neovim instances, but don't close the browser window... let Spectron
        // take care of that.
        editorManager.setCloseWhenNoEditors(false)
        try {
            await App.quit()
        } catch (ex) {
            Log.error(ex)
        }
        Log.info("[AUTOMATION] Quit successfully")

        const resultElement = this._createElement(
            "automated-test-result",
            this._getOrCreateTestContainer("automated-test-container"),
        )

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
