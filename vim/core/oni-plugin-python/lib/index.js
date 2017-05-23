const fs = require("fs")
const path = require("path")
const childProcess = require("child_process")

const activate = (Oni) => {

    // TODO: Remove log file
    const serverOptions = {
        command: "pyls",
    }

    const client = Oni.createLanguageClient(serverOptions, (filePath) => {
        return Promise.resolve({
            clientName: "python",
            // TODO: Remove hardcoded dependency
            rootPath: "file:///" + filePath,
            capabilities: {
                highlightProvider: true
            }
        })
    })
}

module.exports = {
    activate
}
