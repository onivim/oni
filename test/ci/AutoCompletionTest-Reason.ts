/**
 * Test scripts for `ocaml-language-server` completion for Reason
 */

import * as assert from "assert"
import * as childProcess from "child_process"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as rimraf from "rimraf"

import * as Oni from "oni-api"

import { getCompletionElement, navigateToFile } from "./Common"

// tslint:disable:no-console

export const test = async (oni: Oni.Plugin.Api) => {

    await oni.automation.waitForEditors()

    const reasonProjectFolder = createReasonProject()
    const fileToOpen = path.join(reasonProjectFolder, "src", "demo.re")

    await navigateToFile(fileToOpen, oni)

    oni.automation.sendKeys("o")
    await oni.automation.sleep(500)
    oni.automation.sendKeys("Js.")

    // Wait for completion popup to show
    await oni.automation.waitFor(() => getCompletionElement() !== null)

    // Check for 'alert' as an available completion
    const completionElement = getCompletionElement()
    const textContent = completionElement.textContent

    assert.ok(textContent.indexOf("log") >= 0, "Verify 'log' was presented as a completion")
}

const createReasonProject = (): string => {
    const nodeModulesBinFolder = path.join(__dirname, "..", "..", "..", "node_modules", ".bin")

    const executable = os.platform() === "win32" ? "bsb.cmd" : "bsb"

    const bsbExecutable = path.join(nodeModulesBinFolder, executable)

    console.log("bsb executable: " + bsbExecutable)

    const projectFolder = path.join(os.tmpdir(), "oni-test-reason-project")

    if (fs.existsSync(projectFolder)) {
        rimraf.sync(projectFolder)
    }

    console.log("Creating project at: " + projectFolder)

    const output = childProcess.spawnSync(bsbExecutable, ["-init", "oni-test-reason-project", "-theme", "basic-reason"], { cwd: os.tmpdir() })
    console.log(output.stderr.toString())
    console.log(output.stdout.toString())

    console.log("Building project...")

    const output2 = childProcess.execSync("npm run build", { cwd: projectFolder })

    console.log(output2.toString())

    console.log("Project built successfully!")

    return projectFolder
}
