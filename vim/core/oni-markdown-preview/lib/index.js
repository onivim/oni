const path = require("path")
const os = require("os")

const activate = (Oni) => {

    Oni.commands.registerCommand("markdown.preview", (args) => {
        Oni.windows.split(1, null)
    })

}

module.exports = {
    activate
}
