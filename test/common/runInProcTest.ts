import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

import * as Config from "./Config"
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
        const configPath = Config.configPath

        let oni: Oni

        beforeEach(async () => {
            logWithTimeStamp("BEFORE EACH: " + testName)

            Config.backupConfig()

            if (testCase.configPath) {
                console.log("Writing config from: " + testCase.configPath)
                const configContents = fs.readFileSync(testCase.configPath)
                console.log("Writing config to: " + configPath)
                fs.writeFileSync(configPath, configContents)
            }

            oni = new Oni()
            logWithTimeStamp("- Calling oni.start")
            await oni.start()
            logWithTimeStamp("- oni.start complete")
        })

        afterEach(async () => {
            console.log("[AFTER EACH]: " + testName)
            await oni.close()

            if (fs.existsSync(configPath)) {
                console.log("--Removing existing config..")
                fs.unlinkSync(configPath)
            }

            Config.restoreConfig()
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
            await oni.client.waitForExist(".automated-test-result", 30000)
            const resultText = await oni.client.getText(".automated-test-result")

            logWithTimeStamp("---RESULT")
            console.log(resultText) // tslint:disable-line
            console.log("---")
            console.log("")

            console.log("Retrieving logs...")

            await oni.client.waitForExist(".automated-test-logs")
            const clientLogs = await oni.client.getText(".automated-test-logs")
            console.log("---LOGS (During run): ")

            const logs = JSON.parse(clientLogs).forEach((log) => console.log(log))

            console.log("---")

            const result = JSON.parse(resultText)
            assert.ok(result.passed)
        })
    })
}
