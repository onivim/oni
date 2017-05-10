const Q = require("q")
const path = require("path")
const os = require("os")
const exec = require("child_process").exec

const activate = (Oni) => {

    Oni.on("buffer-enter", () => {
    })

    const statusBarItem = Oni.statusBar.createItem(0, 0)
    const element = document.createElement("div")
    element.textContent = "Hello from plugin"
    statusBarItem.setContents(element)
    statusBarItem.show()
}

module.exports = {
    activate
}
