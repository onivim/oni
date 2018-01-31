import * as assert from "assert"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as mkdirp from "mkdirp"

import { Oni, runInProcTest } from "./common"

const LongTimeout = 5000

const CiTests = [
    // Core functionality tests
    "Api.Buffer.AddLayer",
    "Api.Overlays.AddRemoveTest",
    "AutoClosingPairsTest",
    "AutoCompletionTest-CSS",
    "AutoCompletionTest-HTML",
    "AutoCompletionTest-TypeScript",
    "Editor.ExternalCommandLineTest",
    "LargeFileTest",
    "PaintPerformanceTest",
    "QuickOpenTest",
    "StatusBar-Mode",
    "NoInstalledNeovim",
    "Workspace.ConfigurationTest",

    // Regression Tests
    "Regression.1251.NoAdditionalProcessesOnStartup",
    "Regression.1296.SettingColorsTest",
    "Regression.1295.UnfocusedWindowTest",
]

const WindowsOnlyTests = []

const OSXOnlyTests = ["AutoCompletionTest-Reason", "OSX.WindowTitleTest"]

// tslint:disable:no-console

import * as Platform from "./../browser/src/Platform"

export interface ITestCase {
    name: string
    testPath: string
    configPath: string
}

// tslint:disable-next-line only-arrow-functions
describe("ci tests", function() {
    const tests = Platform.isWindows()
        ? [...CiTests, ...WindowsOnlyTests]
        : Platform.isMac() ? [...CiTests, ...OSXOnlyTests] : CiTests

    tests.forEach(test => {
        runInProcTest(path.join(__dirname, "ci"), test)
    })
})
