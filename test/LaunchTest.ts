import * as assert from "assert"
import * as path from "path"

import { Application } from "spectron"

const getExecutablePath = () => {
    switch (process.platform) {
        case "win32":
            return path.join(__dirname, "..", "..", "dist", "win-ia32-unpacked", "Oni.exe")
        case "darwin":
            return path.join(__dirname, "..", "..", "dist", "mac", "Oni.app", "Contents", "MacOS", "Oni")
        case "linux":
            const archFlag = process.arch === "x64" ? "" : "ia32-"
            return path.join(__dirname, "..", "..", "dist", `linux-${archFlag}unpacked`, "oni")
        default:
            throw `Unable to find Oni executable for platform ${process.platform}`
    }
}

describe("application launch", () => {
    let app: Application

    beforeEach(() => {
        app = new Application({
            path: getExecutablePath(),
        })

        return app.start()
    })

    afterEach(() => {
        if (app && app.isRunning()) {
            return app.stop()
        }
    })

    it("launches oni", () => {
        return app.client.waitUntilWindowLoaded()
            .then(() => app.client.getWindowCount())
            .then((count) => assert.equal(count, 1))
    })
})
