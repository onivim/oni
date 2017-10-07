const fs = require("fs")
const path = require("path")
const childProcess = require("child_process")

const activate = (Oni) => {

    const command = Oni.configuration.getValue("cpp.langServerCommand", "clangd")

    const serverOptions = {
        command,
        stderrAsLog: true,
    }

    const getInitializationOptionsAsync = (filePath) => {
        return Promise.resolve({
            clientName: "cpp",
            disableDocumentSymbol: false,
            rootPath: "file:///" + filePath,
        })
    }

    const client = Oni.createLanguageClient(serverOptions, getInitializationOptionsAsync)
}

module.exports = {
    activate,
}
