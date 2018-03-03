import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

import { Oni } from "./Oni"

const findProcess = require("find-process") // tslint:disable-line

// tslint:disable:no-console

export interface ITestCase {
    name: string
    testPath: string
    configPath: string
    allowLogFailures: boolean
}

export interface IFailedTest {
    test: string
    path: string
    expected: any
    actual: any
}

const normalizePath = p => p.split("\\").join("/")

const loadTest = (rootPath: string, testName: string): ITestCase => {
    const testPath = path.join(rootPath, testName + ".js")

    const testMeta = require(testPath)
    const testDescription = testMeta.settings || {}

    const normalizedMeta: ITestCase = {
        name: testDescription.name || testName,
        testPath: normalizePath(testPath),
        configPath: getConfigPath(testMeta.settings, rootPath),
        allowLogFailures: testDescription.allowLogFailures,
    }

    return normalizedMeta
}

import * as os from "os"

const getConfigPath = (settings: any, rootPath: string) => {
    settings = settings || {}

    if (settings.configPath) {
        return normalizePath(path.join(rootPath, settings.configPath))
    } else if (settings.config) {
        return normalizePath(serializeConfig(settings.config))
    } else {
        // Fix #1436 - if no config is specified, we'll just use
        // the empty config, so that the user's config doesn't
        // impact the test results.
        return normalizePath(serializeConfig({}))
    }
}

// Helper method to write a config to a temporary folder
// Returns the path to the serialized config
const serializeConfig = (configValues: { [key: string]: any }): string => {
    const stringifiedConfig = Object.keys(configValues).map(key => {
        return `"${key}": ${JSON.stringify(configValues[key])},`
    })

    const outputConfig = `// User Configuration${os.EOL}${os.EOL}module.exports = {${
        os.EOL
    }${stringifiedConfig.join(os.EOL)}${os.EOL}}`

    const folder = os.tmpdir()
    const fileName = "config_" + new Date().getTime().toString() + ".js"

    const fullFilepath = path.join(folder, fileName)
    console.log("Writing config to: " + fullFilepath)
    console.log("Config contents: " + outputConfig)
    fs.writeFileSync(fullFilepath, outputConfig)
    return fullFilepath
}

const startTime = new Date().getTime()

const logWithTimeStamp = (message: string) => {
    const currentTime = new Date().getTime()
    const delta = currentTime - startTime
    const deltaInSeconds = delta / 1000

    console.log(`[${deltaInSeconds}] ${message}`)
}

// Sometimes, on the automation machines, Oni will still be running
// when starting the test. It will fail if there is an existing instance
// running, so we need to make sure to finish it.
const ensureOniNotRunning = async () => {
    let attempts = 1
    const maxAttempts = 5

    while (attempts < maxAttempts) {
        console.log(`${attempts}/${maxAttempts} Active Processes:`)

        const nvimProcessGone = await tryToKillProcess("nvim")
        const chromeDriverProcessGone = await tryToKillProcess("chromedriver")
        const oniProcessGone = await tryToKillProcess("oni")

        if (nvimProcessGone && chromeDriverProcessGone && oniProcessGone) {
            console.log("All processes gone!")
            return
        }

        attempts++
    }
}

const tryToKillProcess = async (name: string): Promise<boolean> => {
    const oniProcesses = await findProcess("name", "oni")
    oniProcesses.forEach(processInfo => {
        console.log(` - Name: ${processInfo.name} PID: ${processInfo.pid}`)
    })
    const isOniProcess = processInfo => processInfo.name.toLowerCase().indexOf(name) >= 0
    const filteredProcesses = oniProcesses.filter(isOniProcess)
    console.log(`- Found ${filteredProcesses.length} processes with name:  ${name}`)

    if (filteredProcesses.length === 0) {
        console.log("No Oni processes found - leaving.")
        return true
    }

    filteredProcesses.forEach(processInfo => {
        console.log("Attemping to kill pid: " + processInfo.pid)
        // Sometimes, there can be a race condition here. For example,
        // the process may have closed between when we queried above
        // and when we try to kill it. So we'll wrap it in a try/catch.
        try {
            process.kill(processInfo.pid)
        } catch (ex) {
            console.warn(ex)
        }
    })

    return false
}

export const runInProcTest = (
    rootPath: string,
    testName: string,
    timeout: number = 5000,
    failures: IFailedTest[] = null,
) => {
    describe(testName, () => {
        let testCase: ITestCase
        let oni: Oni

        beforeEach(async () => {
            logWithTimeStamp("BEFORE EACH: " + testName)

            logWithTimeStamp(" - Closing existing instances...")
            await ensureOniNotRunning()
            logWithTimeStamp(" - Finished closing")

            testCase = loadTest(rootPath, testName)
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
            const value = await oni.client.waitForExist(".automated-test-result", 300000)
            logWithTimeStamp("waitForExist for 'automated-test-result' complete: " + value)

            console.log("Retrieving logs...")
            const writeLogs = (logs: any[]): void => {
                logs.forEach(log => {
                    const logMessage = `[${log.level}] ${log.message}`
                    console.log(logMessage)

                    if (log.level === "SEVERE" && !testCase.allowLogFailures) {
                        assert.ok(false, logMessage)
                    }
                })
            }

            console.log("Getting result...")
            const resultText = await oni.client.getText(".automated-test-result")
            const result = JSON.parse(resultText)

            if (!result || !result.passed) {
                const rendererLogs: any[] = await oni.client.getRenderProcessLogs()
                console.log("")
                console.log("---LOGS (Renderer): " + testName)
                writeLogs(rendererLogs)
                console.log("--- " + testName + " ---")

                const mainProcessLogs: any[] = await oni.client.getMainProcessLogs()
                console.log("---LOGS (Main): " + testName)
                writeLogs(mainProcessLogs)
                console.log("--- " + testName + " ---")
            } else {
                console.log("-- LOGS: Skipped writing logs because the test passed.")
            }

            console.log("")
            logWithTimeStamp("---RESULT: " + testName)
            console.log(resultText) // tslint:disable-line
            console.log("--- " + testName + " ---")
            console.log("")

            if (failures && !result.passed) {
                const failedTest: IFailedTest = {
                    test: testName,
                    path: testCase.testPath,
                    expected: result.exception.expected,
                    actual: result.exception.actual,
                }
                failures.push(failedTest)
            }

            assert.ok(result.passed)
        })
    })
}
