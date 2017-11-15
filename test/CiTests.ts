import * as assert from "assert"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as mkdirp from "mkdirp"

import { Oni, runInProcTest } from "./common"


const LongTimeout = 5000

const CiTests = [
    "AutoCompletionTest",
    "BasicEditingTest",
    "QuickOpenTest",
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
        runInProcTest(path.join(__dirname, "ci"), test)
    })
})
