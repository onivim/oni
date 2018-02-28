// Helper script to load webpack

const WEBPACK_BUNDLE_URL = "http://localhost:8191/bundle.js"

const hotReloadElement = document.createElement("div")
hotReloadElement.style.position = "absolute"
hotReloadElement.style.left = "0px"
hotReloadElement.style.right = "0px"
hotReloadElement.style.bottom = "0px"
hotReloadElement.style.top = "0px"
hotReloadElement.style.display = "flex"
hotReloadElement.style.backgroundColor = "black"
hotReloadElement.style.color = "white"
hotReloadElement.style.flexDirection = "column"
hotReloadElement.style.justifyContent = "center"
hotReloadElement.style.alignItems = "center"

const oniImage = document.createElement("img")
oniImage.className = "webpack-loading-image"
oniImage.src = "build/icons/128x128.png"

const textElement = document.createElement("span")
textElement.className = "webpack-loading-text"
textElement.textContent = "BUILD: Waiting for webpack initialization..."

const statusElement = document.createElement("span")
statusElement.className = "webpack-loading-status"
statusElement.textContent = ""

hotReloadElement.appendChild(oniImage)
hotReloadElement.appendChild(textElement)
hotReloadElement.appendChild(statusElement)

document.body.appendChild(hotReloadElement)

let attempt = 1

let initialized = false

const setStatus = statusText => {
    console.log(statusText)
    statusElement.textContent = statusText
}

const check = () => {
    setStatus("Checking bundle - attempt " + attempt)

    fetch(WEBPACK_BUNDLE_URL).then(
        () => {
            setStatus("Webpack initialized! Loading...")
            start()
        },
        () => {
            setStatus("Last fetch failed. Retrying...")
        },
    )
}
check()

let interval = window.setInterval(() => {
    check()
    attempt++
}, 1000)

const start = () => {
    if (!initialized) {
        initialized = true
        window.clearInterval(interval)

        document.body.removeChild(hotReloadElement)

        const scriptTag = document.createElement("script")
        scriptTag.src = WEBPACK_BUNDLE_URL
        document.body.appendChild(scriptTag)

        // Once the script comes in, it likely will have missed the 'init' event
        scriptTag.onload = () => {
            require("electron")
                .remote.getCurrentWindow()
                .send("init", { args: [], workingDirectory: process.cwd() })
        }
    }
}
