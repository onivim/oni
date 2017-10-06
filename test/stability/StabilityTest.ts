import * as assert from "assert"
import * as path from "path"

import { Application } from "spectron"

const getExecutablePath = () => {
    switch (process.platform) {
        case "win32":
            return path.join(__dirname, "..", "..", "..", "dist", "win-ia32-unpacked", "Oni.exe")
        case "darwin":
            return path.join(__dirname, "..", "..", "..", "dist", "mac", "Oni.app", "Contents", "MacOS", "Oni")
        case "linux":
            const archFlag = process.arch === "x64" ? "" : "ia32-"
            return path.join(__dirname, "..", "..", "..", "dist", `linux-${archFlag}unpacked`, "oni")
        default:
            throw new Error(`Unable to find Oni executable for platform ${process.platform}`)
    }
}

const LongTimeout = 5000
    describe("application launch", function () { // tslint:disable-line only-arrow-functions

        let app: Application

        beforeEach(() => {
            app = new Application({
                path: getExecutablePath(),
                args: ["C:/oni/lib/browser/bundle.js"],
            })

            return app.start()
        })

        afterEach(() => {
            if (app && app.isRunning()) {
                return app.stop()
            }
        })

        const individualTest = () => {
            it("test", async () => {

                console.log("App started...")
                await app.client.waitUntilWindowLoaded()
                    .then(() => app.client.getWindowCount())
                    .then((count) => assert.equal(count, 1))
                    .then(() => app.client.waitForExist(".editor", LongTimeout))
                    .then(() => app.client.getText(".editor"))
                    .then((text) => assert(text && text.length > 0, "Validate editor element is present"))

                console.log("App loaded succesfully.")
            })
        }

        for (var i = 0; i < 50; i++) {
            console.log("setting up test")
            individualTest()
        }
    })
