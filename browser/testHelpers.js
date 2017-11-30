const  Module = require("module")
const originalRequire = Module.prototype.require

if (global.window) {

    const originalSetTimeout = global.setTimeout

    const lolex = require("lolex")
    const clock = lolex.install()
    // const createMockRaf = require("mock-raf")
    // const mockRaf = createMockRaf()

    // sinon.stub(window, "requestAnimationFrame", mockRaf.raf)

    // global.mockRaf = mockRaf

    console.log("clock installed")

    global.clock = clock

    global.waitForPromiseResolution = (promise) => {

        return new Promise((res) => {
                originalSetTimeout(() => res(), 1)
        })

    }
}

console.log("Hooking require, so that we don't import .less files")
Module.prototype.require = function() {
    if (arguments[0].indexOf(".less") >= 0) {
        console.warn("Skipping require for: " + arguments[0])
        return
    }

    return originalRequire.apply(this, arguments)
}
