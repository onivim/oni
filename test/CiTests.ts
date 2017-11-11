import * as assert from "assert"
import * as path from "path"

import { Oni } from "./common"

const LongTimeout = 5000

const CiTests = [
    "AutoCompletionTest",
    "BasicEditingTest",
    "QuickOpenTest",
]

describe("ci tests", function() { // tslint:disable-line only-arrow-functions
    // Retry up to two times
    this.retries(2)

    let oni: Oni

    beforeEach(async () => {
        oni = new Oni()
        return oni.start()
    })

    afterEach(async () => {
        return oni.close()
    })

    CiTests.forEach((test) => {

        const testPath = path.join(__dirname, "ci", test + ".js")
        const normalizedTestPath = testPath.split("\\").join("/")

        it("ci test: " + test, async () => {
            await oni.client.waitForExist(".editor", LongTimeout)
            const text = await oni.client.getText(".editor")
            assert(text && text.length > 0, "Validate editor element is present")

            console.log("Test path: " + normalizedTestPath) // tslint:disable-line

            oni.client.execute("Oni.automation.runTest('" + normalizedTestPath + "')")

            console.log("Waiting for result...") // tslint:disable-line
            await oni.client.waitForExist(".automated-test-result", 30000)
            const resultText = await oni.client.getText(".automated-test-result")
            console.log("Got result: " + resultText) // tslint:disable-line

            const result = JSON.parse(resultText)
            assert.ok(result.passed)
        })
    })
})
