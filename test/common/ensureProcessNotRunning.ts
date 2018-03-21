import * as assert from "assert"
import * as fs from "fs"
import * as path from "path"

import { Oni } from "./Oni"

const findProcess = require("find-process") // tslint:disable-line

// Sometimes, on the automation machines, Oni will still be running
// when starting the test. It will fail if there is an existing instance
// running, so we need to make sure to finish it.
export const ensureProcessNotRunning = async (processName: string) => {
    let attempts = 1
    const maxAttempts = 5

    while (attempts < maxAttempts) {
        console.log(`${attempts}/${maxAttempts} Active Processes:`)

        const nvimProcessGone = await tryToKillProcess(processName)
        const oniProcessGone = await tryToKillProcess(processName)

        if (nvimProcessGone && oniProcessGone) {
            console.log("All processes gone!")
            return
        }

        attempts++
    }
}

const tryToKillProcess = async (name: string): Promise<boolean> => {
    const oniProcesses = await findProcess("name", "oni")
    oniProcesses.forEach(processInfo => {
        console.log(` - Name: ${processInfo.name} PID: ${processInfo.pid}`)
    })
    const isOniProcess = processInfo => processInfo.name.toLowerCase().indexOf(name) >= 0
    const filteredProcesses = oniProcesses.filter(isOniProcess)
    console.log(`- Found ${filteredProcesses.length} processes with name:  ${name}`)

    if (filteredProcesses.length === 0) {
        console.log("No Oni processes found - leaving.")
        return true
    }

    filteredProcesses.forEach(processInfo => {
        console.log("Attemping to kill pid: " + processInfo.pid)
        // Sometimes, there can be a race condition here. For example,
        // the process may have closed between when we queried above
        // and when we try to kill it. So we'll wrap it in a try/catch.
        try {
            process.kill(processInfo.pid)
        } catch (ex) {
            console.warn(ex)
        }
    })

    return false
}
