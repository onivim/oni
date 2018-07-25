/**
 * WindowsInstallerTests
 */

import * as assert from "assert"
import * as cp from "child_process"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

const rootPath = path.join(__dirname, "..", "..", "..")
const packageJsonPath = path.join(rootPath, "package.json")
const oniVersion = require(packageJsonPath).version // tslint:disable-line

let arch = os.arch() === "x32" ? "-ia32" : ""

if (process.env.APPVEYOR) {
    arch = process.env.PLATFORM === "x86" ? "-ia32" : ""
}

const installExecutablePath = path.join(rootPath, "dist", `Oni-${oniVersion}${arch}-win.exe`)

const runInstaller = (setupExecutablePath: string, installDirectory: string) => {
    const doesInstallerExist = fs.existsSync(setupExecutablePath)

    assert.strictEqual(
        doesInstallerExist,
        true,
        "Validate installer exists at: " + setupExecutablePath,
    )

    return cp.spawnSync(installExecutablePath, [
        "/silent",
        "/norestart",
        `/dir=${installDirectory}`,
    ])
}

const runUninstaller = (uninstallerExecutablePath: string) => {
    return cp.spawnSync(uninstallerExecutablePath, ["/silent", "/norestart"])
}

const getPathRegistryKey = () => {
    // Use the `reg` command line tool to get information about the registry key
    // Use `reg /?` or `reg query /?` at the command line ot get more info

    const result = cp.spawnSync("reg", ["query", "HKCU\\Environment", "/e", "/f", "PATH"])

    const output = result.output.toString()

    // the output is multi-line, so we'll split it up
    const [, , lastLine] = output.split("\r\n")

    return lastLine.substring(29, lastLine.length)
}

const log = msg => console.log(msg) // tslint:disable-line

if (os.platform() === "win32") {
    describe("WindowsInstallerTests", () => {
        this.retries(2)

        it("installs / uninstalls to a test directory", () => {
            const testDirectory = "oni-test-install-" + new Date().getTime()
            const testPath = path.join("C:", testDirectory)

            log("Installing to: " + testPath)
            const result = runInstaller(installExecutablePath, testPath)

            const doesInstallFolderExist = fs.existsSync(testPath)
            assert.strictEqual(doesInstallFolderExist, true, "Validate install folder exists now")

            const doesOniExeExists = fs.existsSync(path.join(testPath, "Oni.exe"))
            assert.strictEqual(doesOniExeExists, true, "Validate Oni.exe exists")

            const uninstallExecutablePath = path.join(testPath, "unins000.exe")
            const doesUninstallExist = fs.existsSync(uninstallExecutablePath)
            assert.strictEqual(doesUninstallExist, true, "Validate uninstaller exists")

            const pathKey = getPathRegistryKey()
            assert.ok(
                pathKey.indexOf(testDirectory) >= 0,
                "Validate path was added to registry key",
            )

            log("Running uninstaller...")
            const uninstallResult = runUninstaller(uninstallExecutablePath)

            assert.strictEqual(
                doesInstallFolderExist,
                true,
                "Validate install folder doesn't exist after uninstall",
            )

            const pathKey2 = getPathRegistryKey()
            assert.ok(
                pathKey2.indexOf(testDirectory) === -1,
                "Validate path was removed from registry after installation",
            )
        })
    })
}
