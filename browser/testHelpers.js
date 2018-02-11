const Module = require("module")
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

    global.waitForPromiseResolution = promise => {
        return new Promise(res => {
            originalSetTimeout(() => res(), 1)
        })
    }
}

const shouldUseCodeCoverage = !!process.env["ONI_CCOV"]
console.log("Code coverage: " + shouldUseCodeCoverage)

console.log("Hooking require, so that we don't import .less files")
Module.prototype.require = function(moduleName, ...args) {
    if (moduleName.indexOf(".less") >= 0) {
        console.warn("Skipping require for: " + moduleName)
        return
    }

    // If ccov is enabled, we should pull the file from the 'ccov' folder created by `npm run ccov:instrument`
    // Idea adapted from:
    // https://github.com/MarshallOfSound/Google-Play-Music-Desktop-Player-UNOFFICIAL-/commit/1b2055b286f1f296c0d48dec714224c14acb3c34
    const ccovFile = shouldUseCodeCoverage
        ? moduleName.replace("../src/", "../src_ccov/")
        : moduleName
    return originalRequire.call(this, ccovFile, ...args)
}
