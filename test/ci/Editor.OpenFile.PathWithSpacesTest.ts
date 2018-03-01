/**
 * Test script to validate opening a path with spaces works as expected.
 *
 * Regression test for #1681
 */

import * as assert from "assert"
import * as os from "os"
import * as fs from "fs"
import * as path from "path"

import * as Oni from "oni-api"
import * as mkdirp from "mkdirp"

const folderName = "folder with spaces"
const fileName = "file with spaces.txt"
const createTestFile = (): string => {
    const fileFullPath = path.join(
        os.tmpdir(),
        new Date().getTime().toString(),
        folderName,
        fileName,
    )
    mkdirp.sync(path.dirname(fileFullPath))
    fs.writeFileSync(fileFullPath, "test contents")
    return fileFullPath
}

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    const file = createTestFile()

    await oni.editors.activeEditor.openFile(file, { openMode: Oni.FileOpenMode.Edit })

    const openFiles = oni.editors.activeEditor.getBuffers()
    assert.strictEqual(openFiles.length, 1, "Validate a single buffer was opened")
    assert.strictEqual(openFiles[0].filePath, file, "Validate the filepath was correct")
}
