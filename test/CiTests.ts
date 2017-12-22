import * as assert from "assert"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as mkdirp from "mkdirp"

import { Oni, runInProcTest } from "./common"

const LongTimeout = 5000

const CiTests = [
    "AutoClosingPairsTest",
    "AutoCompletionTest-CSS",
    "AutoCompletionTest-TypeScript",
    "LargeFileTest",
    "PaintPerformanceTest",
    "QuickOpenTest",
    "StatusBar-Mode",
    "NoInstalledNeovim",
]

const WindowsOnlyTests = [
    // For some reason, the `beginFrameSubscription` call doesn't seem to work on OSX,
    // so we can't properly validate that case on that platform...
    "PaintPerformanceTest",
]

// tslint:disable:no-console

import * as Platform from "./../browser/src/Platform"

export interface ITestCase {
    name: string
    testPath: string
    configPath: string
}

describe("ci tests", function() { // tslint:disable-line only-arrow-functions

    const tests = Platform.isWindows() ? [...CiTests, ...WindowsOnlyTests] : CiTests

    CiTests.forEach((test) => {
        runInProcTest(path.join(__dirname, "ci"), test)
    })
})
