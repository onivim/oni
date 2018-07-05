if (!process.env.ONI_WEBPACK_LOAD) {
    window.eval = global.eval = () => console.warn("eval is not available")
}
// test

console.timeStamp("browser.domloaded")
var path = "lib/browser/bundle.js"
if (process.env.ONI_WEBPACK_LOAD) {
    path = "scripts/dev_webpack_loader.js"
}
var scriptTag = document.createElement("script")
scriptTag.src = path
document.body.appendChild(scriptTag)
