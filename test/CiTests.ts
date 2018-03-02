import * as assert from "assert"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as mkdirp from "mkdirp"

import { IFailedTest, Oni, runInProcTest } from "./common"

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
    "Editor.BufferModifiedState",
    "Editor.OpenFile.PathWithSpacesTest",
    "Editor.TabModifiedState",
    "LargeFileTest",
    "MarkdownPreviewTest",
    "PaintPerformanceTest",
    "QuickOpenTest",
    "StatusBar-Mode",
    "Neovim.InvalidInitVimHandlingTest",
    "NoInstalledNeovim",
    "Sidebar.ToggleSplitTest",
    "WindowManager.ErrorBoundary",
    "Workspace.ConfigurationTest",
    // Regression Tests
    "Regression.1251.NoAdditionalProcessesOnStartup",
    "Regression.1296.SettingColorsTest",
    "Regression.1295.UnfocusedWindowTest",
    "TextmateHighlighting.ScopesOnEnterTest",
]

const WindowsOnlyTests = [
    // For some reason, the `beginFrameSubscription` call doesn't seem to work on OSX,
    // so we can't properly validate that case on that platform...
    "PaintPerformanceTest",
]

const OSXOnlyTests = ["OSX.WindowTitleTest"]

// tslint:disable:no-console

import * as Platform from "./../browser/src/Platform"

export interface ITestCase {
    name: string
    testPath: string
    configPath: string
}

const FGRED = "\x1b[31m"
const FGWHITE = "\x1b[37m"
const FGGREEN = "\x1b[32m"
const FGYELLOW = "\x1b[33m"

// tslint:disable-next-line only-arrow-functions
describe("ci tests", function() {
    const tests = Platform.isWindows()
        ? [...CiTests, ...WindowsOnlyTests]
        : Platform.isMac() ? [...CiTests, ...OSXOnlyTests] : CiTests

    const testFailures: IFailedTest[] = []
    CiTests.forEach(test => {
        runInProcTest(path.join(__dirname, "ci"), test, 5000, testFailures)
    })

    // After all of the tests are completed display failures
    after(() => {
        if (testFailures.length > 0) {
            console.log("\n", FGRED, "---- FAILED TESTS ----\n")
            testFailures.forEach(failure => {
                console.log(FGYELLOW, "  [FAILED]:", FGWHITE, failure.test)
                console.log(FGWHITE, "     Expected:", FGGREEN, failure.expected)
                console.log(FGWHITE, "     Actual:", FGRED, failure.actual)
                console.log(FGWHITE, "     Path:", failure.path, "\n")
            })
            console.log("")
        }
    })
})
