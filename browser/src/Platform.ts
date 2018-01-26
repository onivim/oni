/// <reference path="./../../definitions/sudo-prompt.d.ts"/>

import * as fs from "fs"
import * as os from "os"
import * as path from "path"

export const isWindows = () => os.platform() === "win32"
export const isMac = () => os.platform() === "darwin"
export const isLinux = () => os.platform() === "linux"

export const getUserHome = () => (isWindows() ? process.env["APPDATA"] : process.env["HOME"]) // tslint:disable-line no-string-literal

export const getLinkPath = () => (isMac() ? "/usr/local/bin/oni" : "") // TODO: windows + linux
export const isAddedToPath = () => {
    if (isMac()) {
        try {
            fs.lstatSync(getLinkPath())
        } catch (_) {
            return false
        }
        return true
    }

    return false
}
export const removeFromPath = () => (isMac() ? fs.unlinkSync(getLinkPath()) : false) // TODO: windows + other

export const addToPath = async () => {
    if (isMac()) {
        const appDirectory = path.join(path.dirname(process.mainModule.filename), "..", "..")
        const options = { name: "Oni", icns: path.join(appDirectory, "Resources", "Oni.icns") }
        const linkPath = path.join(appDirectory, "Resources", "app", "oni.sh")
        await _runSudoCommand(`ln -s ${linkPath} ${getLinkPath()}`, options)
    }
}

const _runSudoCommand = async (command: string, options: any) => {
    const sudo = await import("sudo-prompt")
    return new Promise(resolve => {
        sudo.exec(command, options, (error: Error, stdout: string, stderr: string) => {
            resolve({ error, stdout, stderr })
        })
    })
}
