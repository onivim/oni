import * as assert from "assert"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as mkdirp from "mkdirp"

import { Oni, runInProcTest } from "./common"

const LongTimeout = 5000

const CiTests = [
    "Api.Buffer.AddLayer",
    "AutoClosingPairsTest",
    "AutoCompletionTest-CSS",
    "AutoCompletionTest-HTML",
    "AutoCompletionTest-TypeScript",
    "LargeFileTest",
    "PaintPerformanceTest",
    "QuickOpenTest",
    "StatusBar-Mode",
    "NoInstalledNeovim",
    "Regression.1251.NoAdditionalProcessesOnStartup",
]

const WindowsOnlyTests = [
]

const OSXOnlyTests = [
    "AutoCompletionTest-Reason",
    "OSX.WindowTitleTest",
]

// tslint:disable:no-console

import * as Platform from "./../browser/src/Platform"

export interface ITestCase {
    name: string
    testPath: string
    configPath: string
}

describe("ci tests", function() { // tslint:disable-line only-arrow-functions
    console.log("IS MAC: " + Platform.isMac())

    const tests = Platform.isWindows() ? [...CiTests, ...WindowsOnlyTests] : (Platform.isMac() ? [...CiTests, ...OSXOnlyTests] : CiTests)

    tests.forEach((test) => {
        runInProcTest(path.join(__dirname, "ci"), test)
    })
})
