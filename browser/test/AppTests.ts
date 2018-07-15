import * as assert from "assert"
import { remote } from "electron"
import * as sinon from "sinon"
import { quit } from "../src/App"

describe("App", () => {
    describe("oni.quit", () => {
        it("should invoke remote.app.quit() on Mac", async () => {
            // Stub remote.app.quit() function
            const originalQuit = remote.app.quit
            const quitStub = sinon.stub()
            remote.app.quit = quitStub
            // Stub process.platform
            const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform")
            Object.defineProperty(process, "platform", { value: "darwin" })
            // Test quit()
            await quit()
            assert.ok(quitStub.called)
            // Restore stubs
            remote.app.quit = originalQuit
            Object.defineProperty(process, "platform", originalPlatform)
        })

        it("shouldn't invoke remote.app.quit() except on Mac", async () => {
            // Stub remote.app.quit() function
            const originalQuit = remote.app.quit
            const quitStub = sinon.stub()
            remote.app.quit = quitStub
            // Stub process.platform
            const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform")
            Object.defineProperty(process, "platform", { value: "win32" })
            // Test quit()
            await quit()
            assert.ok(quitStub.notCalled)
            // Restore stubs
            remote.app.quit = originalQuit
            Object.defineProperty(process, "platform", originalPlatform)
        })
    })
})
