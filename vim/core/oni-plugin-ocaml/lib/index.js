const fs = require("fs")
const path = require("path")
const childProcess = require("child_process")

const activate = (Oni) => {

    const command = Oni.configuration.getValue("python.langServerCommand", "pyls")

    const serverOptions = {
        command,
    }

    const getInitializationOptionsAsync = (filePath) => {
        return Promise.resolve({
            clientName: "python",
            rootPath: "file:///" + filePath,
            capabilities: {
                highlightProvider: true
            }
        })
    }

    const client = Oni.createLanguageClient(serverOptions, getInitializationOptionsAsync)
}

module.exports = {
    activate
}
