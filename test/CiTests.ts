import * as assert from "assert"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as mkdirp from "mkdirp"

import { Oni, runInProcTest } from "./common"

const LongTimeout = 5000

const CiTests = [
    "BasicEditingTest",
//    "AutoCompletionTest-CSS",
    "AutoCompletionTest-TypeScript",
    "QuickOpenTest",
    "StatusBar-Mode",
    "NoInstalledNeovim",
]

// tslint:disable:no-console

import * as Config from "./common/Config"

import * as Platform from "./../browser/src/Platform"

export interface ITestCase {
    name: string
    testPath: string
    configPath: string
}

describe("ci tests", function() { // tslint:disable-line only-arrow-functions

    CiTests.forEach((test) => {
        runInProcTest(path.join(__dirname, "ci"), test)
    })
})
