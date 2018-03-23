import * as assert from "assert"
import * as path from "path"

import { Application } from "spectron"

import { ensureProcessNotRunning } from "./ensureProcessNotRunning"

const log = (msg: string) => {
    console.log(msg) // tslint:disable-line no-console
}

const isCiBuild = () => {
    const ciBuild = !!(
        process.env.ONI_AUTOMATION_USE_DIST_BUILD ||
        process.env.CONTINUOUS_INTEGRATION /* set by travis */ ||
        process.env.APPVEYOR
    ) /* set by appveyor */
    log("isCiBuild: " + ciBuild)
    return ciBuild
}

const getWindowsExcutablePath = () => {
    switch (process.arch) {
        case "x86":
            return path.join(__dirname, "..", "..", "..", "dist", "win-ia32-unpacked", "Oni.exe")
        case "x64":
            return path.join(__dirname, "..", "..", "..", "dist", "win-unpacked", "Oni.exe")
        default:
            throw new Error(`Unable to find Oni executable for Windows arch ${process.arch}`)
    }
}

const getExecutablePathOnCiMachine = () => {
    switch (process.platform) {
        case "win32":
            return getWindowsExcutablePath()
        case "darwin":
            return path.join(
                __dirname,
                "..",
                "..",
                "..",
                "dist",
                "mac",
                "Oni.app",
                "Contents",
                "MacOS",
                "Oni",
            )
        case "linux":
            const archFlag = process.arch === "x64" ? "" : "ia32-"
            return path.join(
                __dirname,
                "..",
                "..",
                "..",
                "dist",
                `linux-${archFlag}unpacked`,
                "oni",
            )
        default:
            throw new Error(`Unable to find Oni executable for platform ${process.platform}`)
    }
}

const getExecutablePathLocally = () => {
    const nodeModulesBinPath = path.join(__dirname, "..", "..", "..", "node_modules", ".bin")
    return process.platform === "win32"
        ? path.join(nodeModulesBinPath, "electron.cmd")
        : path.join(nodeModulesBinPath, "electron")
}

const getArgsForCiMachine = () => []
const getArgsForLocalExecution = () => [
    path.join(__dirname, "..", "..", "..", "lib", "main", "src", "main.js"),
]

export interface OniStartOptions {
    configurationPath?: string
}

export class Oni {
    private _app: Application

    public get client(): any {
        return this._app.client
    }

    public async start(options: OniStartOptions = {}): Promise<void> {
        const ciBuild = isCiBuild()
        const executablePath = ciBuild ? getExecutablePathOnCiMachine() : getExecutablePathLocally()
        const executableArgs = ciBuild ? getArgsForCiMachine() : getArgsForLocalExecution()
        log("Using executable path: " + executablePath)
        log("Using executable args: " + executableArgs)

        log("Start options: " + JSON.stringify(options))

        this._app = new Application({
            path: executablePath,
            args: executableArgs,
            env: options.configurationPath ? { ONI_CONFIG_FILE: options.configurationPath } : {},
        })

        log("Oni starting...")
        await this._app.start()
        log("Oni started. Waiting for window load..")
        await this.client.waitUntilWindowLoaded()
        const count = await this.client.getWindowCount()
        assert.ok(count > 0)

        log(`Window loaded. Reports ${count} windows.`)
    }

    public async close(): Promise<void> {
        log("Closing Oni...")
        const windowCount = await this.client.getWindowCount()
        log(`- current window count: ${windowCount}`)
        if (this._app) {
            let attempts = 1
            while (attempts < 5) {
                if (!this._app.isRunning()) {
                    log("- _app.isRunning() is now false")
                    break
                }

                log("- Calling _app.stop")
                let didStop = false
                const promise1 = this._app.stop().then(
                    () => {
                        log("_app.stop promise completed!")
                        didStop = true
                    },
                    err => {
                        // tslint:disable-next-line
                        console.error(err)
                    },
                )

                const promise2 = sleep(15000)

                log("- Racing with 15s timer...")
                const race = Promise.race([promise1, promise2])
                await race

                log("- Race complete. didStop: " + didStop)

                if (!didStop) {
                    log("- Attemping to force close processes:")
                    await ensureProcessNotRunning("nvim")
                    log("- Force close complete")
                }

                attempts++
            }
        }
        log("Oni closed.")
    }
}

const sleep = (timeout: number = 1000) => {
    return new Promise(resolve => {
        setTimeout(resolve, timeout)
    })
}
