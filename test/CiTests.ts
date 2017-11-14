import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

import { Oni } from "./common"

const LongTimeout = 5000

const CiTests = [
    "AutoCompletionTest",
    "BasicEditingTest",
    "QuickOpenTest",
    "NoInstalledNeovim",
]

import * as Platform from "./../browser/src/Platform"

export interface ITestCase {
    name: string
    testPath: string
    configPath: string
}

const normalizePath = (p) => p.split("\\").join("/")

const loadTest = (testName: string): ITestCase => {
    const ciPath = path.join(__dirname, "ci")
    const testPath = path.join(ciPath, testName + ".js")

    const testMeta = require(testPath)
    const testDescription = testMeta.settings || {}

    const normalizedMeta: ITestCase = {
        name: testDescription.name || testName,
        testPath: normalizePath(testPath),
        configPath: testDescription.configPath ? normalizePath(path.join(ciPath, testDescription.configPath)) : "",
    }

    return normalizedMeta
}

describe("ci tests", function() { // tslint:disable-line only-arrow-functions
    // Retry up to two times
    this.retries(2)

    CiTests.forEach((test) => {

        describe(test, () => {

            const testCase = loadTest(test)

            let oni: Oni

            beforeEach(async () => {

                const configPath = path.join(Platform.getUserHome(), ".oni", "config.js")

                if (fs.existsSync(configPath)) {
                    console.log("--Removing existing config..")
                    fs.unlinkSync(configPath)
                }

                if (testCase.configPath) {
                    console.log("Writing config from: " + testCase.configPath)
                    const configContents = fs.readFileSync(testCase.configPath)
                    console.log("Writing config to: " + configPath)
                    fs.writeFileSync(configPath, configContents)
                }

                oni = new Oni()
                return oni.start()
            })

            afterEach(async () => {
                return oni.close()
            })

            it("ci test: " + test, async () => {
                await oni.client.waitForExist(".editor", LongTimeout)
                const text = await oni.client.getText(".editor")
                assert(text && text.length > 0, "Validate editor element is present")

                console.log("Test path: " + testCase.testPath) // tslint:disable-line

                oni.client.execute("Oni.automation.runTest('" + testCase.testPath + "')")

                console.log("Waiting for result...") // tslint:disable-line
                await oni.client.waitForExist(".automated-test-result", 30000)
                const resultText = await oni.client.getText(".automated-test-result")
                console.log("Got result: " + resultText) // tslint:disable-line

                const result = JSON.parse(resultText)
                assert.ok(result.passed)
            })
        })
    })
})
