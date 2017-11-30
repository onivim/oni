const  Module = require("module")
const originalRequire = Module.prototype.require

console.log("Hooking require, so that we don't import .less files")

Module.prototype.require = function() {
    if (arguments[0].indexOf(".less") >= 0) {
        console.warn("Skipping require for: " + arguments[0])
        return
    }

    return originalRequire.apply(this, arguments)
}
