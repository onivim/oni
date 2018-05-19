import * as assert from "assert"
import * as path from "path"

import { runInProcTest } from "./common"

const TestToRun = process.env["DEMO_TEST"] // tslint:disable-line

// tslint:disable:no-console

console.log("Running test: " + TestToRun)

describe("demo tests", () => {
    runInProcTest(path.join(__dirname, "demo"), TestToRun, 50000)
})
