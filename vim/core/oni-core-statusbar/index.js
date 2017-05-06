const Q = require("q")
const path = require("path")
const os = require("os")
const exec = require("child_process").exec

const activate = (Oni) => {

    Oni.on("buffer-enter", () => {
        alert("Hello from statusbar")
    })
}

module.exports = {
    activate
}
