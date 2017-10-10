const fs = require("fs")
const path = require("path")
const childProcess = require("child_process")

const activate = (Oni) => {

    const serverOptions = {
        module: path.join(__dirname, "..", "..", "..", "..", "node_modules", "javascript-typescript-langserver", "lib", "language-server-stdio.js")
    }

    const getInitializationOptionsAsync = (filePath) => {
        return Promise.resolve({
            clientName: "oni",
            rootPath: "C:/oni",
        })
    }

    const client = Oni.createLanguageClient(serverOptions, getInitializationOptionsAsync)
}

module.exports = {
    activate
}
