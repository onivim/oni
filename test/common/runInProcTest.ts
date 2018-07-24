import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

import { Oni } from "./Oni"

import { ensureProcessNotRunning } from "./ensureProcessNotRunning"

// tslint:disable:no-console

export interface ITestCase {
    name: string
    testPath: string
    allowLogFailures: boolean
    env: {
        [key: string]: string
    }
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
        allowLogFailures: testDescription.allowLogFailures,
        env: {
            ...(testDescription.env || {}),
            ONI_CONFIG_FILE: getConfigPath(testMeta.settings, rootPath),
        },
    }

    return normalizedMeta
}

import * as os from "os"

const getConfigPath = (settings: any, rootPath: string) => {
    settings = settings || {}

    if (settings.configPath) {
        if (!path.isAbsolute(settings.configPath)) {
            return normalizePath(path.join(rootPath, settings.configPath))
        } else {
            return settings.configPath
        }
    } else if (settings.config) {
        return normalizePath(serializeConfig(settings.config))
    } else {
        // Fix #1436 - if no config is specified, we'll just use
        // the empty config, so that the user's config doesn't
        // impact the test results.
        return normalizePath(serializeConfig({ "oni.loadInitVim": false }))
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

export const runInProcTest = (
    rootPath: string,
    testName: string,
    timeout: number = 5000,
    failures: IFailedTest[] = null,
) => {
    // tslint:disable-next-line
    describe(testName, function() {
        // TODO: See if we can remove this to stabilize tests.
        this.retries(2)

        let testCase: ITestCase
        let oni: Oni

        it("ci test: " + testName, async () => {
            try {
                logWithTimeStamp("TEST: " + testName)
                testCase = loadTest(rootPath, testName)
                const startOptions = {
                    env: testCase.env,
                }
                oni = new Oni()

                logWithTimeStamp("Calling oni.start")
                await oni.start(startOptions)
                logWithTimeStamp("Completed oni.start")

                console.log("Waiting for editor element...")
                await oni.client.waitForExist(".editor", timeout)

                logWithTimeStamp("Found editor element. Getting editor element text: ")
                const text = await oni.client.getText(".editor")
                logWithTimeStamp("Editor element text: " + text)

                logWithTimeStamp("Test path: " + testCase.testPath) // tslint:disable-line

                oni.client.execute("Oni.automation.runTest('" + testCase.testPath + "')")

                logWithTimeStamp("Waiting for result...") // tslint:disable-line
                const value = await oni.client.waitForExist(".automated-test-result", 120000)
                logWithTimeStamp("waitForExist for 'automated-test-result' complete: " + value)

                console.log("Retrieving logs...")

                const isLogFailure = (log: any) =>
                    log.level === "SEVERE" && !testCase.allowLogFailures
                const anyLogFailure = (logs: any[]) => logs.filter(isLogFailure).length > 0

                const writeLogs = (logs: any[], forceWrite?: boolean): void => {
                    const anyFailures = anyLogFailure(logs)
                    const shouldWrite = !result || !result.passed || anyFailures || forceWrite

                    logs.forEach(log => {
                        const logMessage = `[${log.level}] ${log.message}`

                        if (shouldWrite) {
                            console.log(logMessage)
                        }

                        if (isLogFailure(log)) {
                            assert.ok(false, logMessage)
                        }
                    })

                    if (!shouldWrite) {
                        console.log("Skipping log output since test passed.")
                    }
                }

                console.log("Getting result...")
                const resultText = await oni.client.getText(".automated-test-result")
                const result = JSON.parse(resultText)

                const rendererLogs: any[] = await oni.client.getRenderProcessLogs()
                console.log("")
                console.log("---LOGS (Renderer): " + testName)
                writeLogs(rendererLogs)
                console.log("--- " + testName + " ---")

                console.log("---LOGS (Main): " + testName)
                if (!result.passed) {
                    const mainProcessLogs: any[] = await oni.client.getMainProcessLogs()
                    mainProcessLogs.forEach(l => {
                        console.log(l)
                    })
                } else {
                    console.log("Skipping log output since test passed.")
                }
                console.log("--- " + testName + " ---")

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
            } finally {
                try {
                    logWithTimeStamp("Calling oni.close...")
                    await oni.close()
                    logWithTimeStamp("Completed oni.close")
                    // tslint:disable-next-line:no-empty
                } catch (e) {}
            }
        })
    })
}
