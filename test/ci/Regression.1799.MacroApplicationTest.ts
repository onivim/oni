/**
 * Regression test for #1799
 *
 * Validate that running a large macro operation doesn't crash the editor
 */

import * as assert from "assert"
import * as path from "path"

import * as Oni from "oni-api"
import { getCollateralPath, navigateToFile } from "./Common"

const testCsvFilePath = path.join(getCollateralPath(), "1799_test.csv")

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await navigateToFile(testCsvFilePath, oni)
}
