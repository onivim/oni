import * as assert from "assert"
import * as path from "path"

import { Application } from "spectron"

const log = (msg: string) => {
    console.log(msg) // tslint:disable-line no-console
}

const getExecutablePath = () => {
    switch (process.platform) {
        case "win32":
            return path.join(__dirname, "..", "..", "..", "dist", "win-ia32-unpacked", "Oni.exe")
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

export interface OniStartOptions {
    configurationPath?: string
}

export class Oni {
    private _app: Application

    public get client(): any {
        return this._app.client
    }

    public async start(options: OniStartOptions = {}): Promise<void> {
        const executablePath = getExecutablePath()
        log("Using executable path: " + executablePath)

        log("Start options: " + JSON.stringify(options))

        this._app = new Application({
            path: executablePath,
            env: options.configurationPath ? { ONI_CONFIG_FILE: options.configurationPath } : {},
        })

        log("Oni starting...")
        await this._app.start()
        log("Oni started. Waiting for window load..")
        await this.client.waitUntilWindowLoaded()
        const count = await this.client.getWindowCount()
        assert.equal(count, 1)

        log("Window loaded.")
    }

    public async close(): Promise<void> {
        log("Closing Oni...")
        if (this._app && this._app.isRunning()) {
            await this._app.stop()
        }
        log("Oni closed.")
    }
}
