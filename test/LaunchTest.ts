import * as assert from "assert"
import * as path from "path"

import { Application } from "spectron"

describe("application launch", function () {

    this.timeout(10000)

    let app: Application

    beforeEach(() => {
        app = new Application({
            path: path.join(__dirname, "..", "..", "dist", "win-ia32-unpacked", "Oni.exe")
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
