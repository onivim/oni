/**
 * Test script to verify per-workspace configuration settings
 */

import * as assert from "assert"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as mkdirp from "mkdirp"

import * as Oni from "oni-api"

import { getTemporaryFolder  } from "./Common"

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    // Create workspace config
    const temporaryFolder = getTemporaryFolder()
    const oniConfigFolder = path.join(temporaryFolder, ".oni")
    mkdirp.sync(oniConfigFolder)

    const oniConfigFile = path.join(oniConfigFolder, "config.js")
    fs.writeFileSync(oniConfigFile, `module.exports = { "citest.someConfig": true }`)

    const workspace = oni.workspace as any
    workspace.changeDirectory(temporaryFolder)

    // Once we've changed directory to that workspace, it should pick up the config value
    oni.automation.waitFor(() => oni.configuration.getValue("citest.someConfig"))
}
