import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

import { Oni } from "./Oni"

// tslint:disable:no-console

export interface ITestCase {
    name: string
    testPath: string
    configPath: string
}

const normalizePath = (p) => p.split("\\").join("/")

const loadTest = (rootPath: string, testName: string): ITestCase => {
    const testPath = path.join(rootPath, testName + ".js")

    const testMeta = require(testPath)
    const testDescription = testMeta.settings || {}

    const normalizedMeta: ITestCase = {
        name: testDescription.name || testName,
        testPath: normalizePath(testPath),
        configPath: testDescription.configPath ? normalizePath(path.join(rootPath, testDescription.configPath)) : "",
    }

    return normalizedMeta
}

const startTime = new Date().getTime()

const logWithTimeStamp = (message: string) => {
    const currentTime = new Date().getTime()
    const delta = currentTime - startTime
    const deltaInSeconds = delta / 1000

    console.log(`[${deltaInSeconds}] ${message}`)
}

export const runInProcTest = (rootPath: string, testName: string, timeout: number = 5000) => {
    describe(testName, () => {

        const testCase = loadTest(rootPath, testName)

        let oni: Oni

        beforeEach(async () => {
            logWithTimeStamp("BEFORE EACH: " + testName)

            const startOptions = {
                configurationPath: testCase.configPath,
            }

            oni = new Oni()
            logWithTimeStamp("- Calling oni.start")
            await oni.start(startOptions)
            logWithTimeStamp("- oni.start complete")
        })

        afterEach(async () => {
            logWithTimeStamp("[AFTER EACH]: " + testName)
            await oni.close()
        })

        it("ci test: " + testName, async () => {
            logWithTimeStamp("TEST: " + testName)
            console.log("Waiting for editor element...")
            await oni.client.waitForExist(".editor", timeout)

            logWithTimeStamp("Found editor element. Getting editor element text: ")
            const text = await oni.client.getText(".editor")
            logWithTimeStamp("Editor element text: " + text)

            logWithTimeStamp("Test path: " + testCase.testPath) // tslint:disable-line

            oni.client.execute("Oni.automation.runTest('" + testCase.testPath + "')")

            logWithTimeStamp("Waiting for result...") // tslint:disable-line
            const value = await oni.client.waitForExist(".automated-test-result", 60000)
            logWithTimeStamp("waitForExist for 'automated-test-result' complete: " + value)

            console.log("Retrieving logs...")
            const writeLogs = (logs: any[]): void => {
                logs.forEach((log) => {
                    console.log(`[${log.level}] ${log.message}`)
                })
            }

            const rendererLogs: any[] = await oni.client.getRenderProcessLogs()
            console.log("")
            console.log("---LOGS (Renderer): " + testName)
            writeLogs(rendererLogs)
            console.log("--- " + testName + " ---")

            console.log("Getting result...")
            const resultText = await oni.client.getText(".automated-test-result")

            console.log("")
            logWithTimeStamp("---RESULT: " + testName)
            console.log(resultText) // tslint:disable-line
            console.log("--- " + testName + " ---")
            console.log("")

            const result = JSON.parse(resultText)
            assert.ok(result.passed)
        })
    })
}
