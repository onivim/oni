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
    "Regression.1295.UnfocusedWindowTest",
    "TextmateHighlighting.ScopesOnEnterTest",
]

const WindowsOnlyTests = [
    // For some reason, the `beginFrameSubscription` call doesn't seem to work on OSX,
    // so we can't properly validate that case on that platform...
    "PaintPerformanceTest",
]

const OSXOnlyTests = [
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

    const tests = Platform.isWindows() ? [...CiTests, ...WindowsOnlyTests] : Platform.isMac() ? [...CiTests, ...OSXOnlyTests] : CiTests

    CiTests.forEach((test) => {
        runInProcTest(path.join(__dirname, "ci"), test)
    })
})
