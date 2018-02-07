import * as assert from "assert"
import * as path from "path"

import { runInProcTest } from "./common"

const DemoTests = [
    "HeroDemo",
    // "HeroScreenshot",
]

// tslint:disable:no-console

describe("demo tests", function() {
    // tslint:disable-line only-arrow-functions
    // Retry up to two times
    this.retries(2)

    DemoTests.forEach(test => {
        runInProcTest(path.join(__dirname, "demo"), test)
    })
})
