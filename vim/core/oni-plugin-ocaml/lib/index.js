const fs = require("fs")
const path = require("path")
const childProcess = require("child_process")

const activate = (Oni) => {

    const command = Oni.configuration.getValue("ocaml.langServerCommand", "ocaml-language-server")

    const debugOptions = {
        command: "node",
        args: ["--inspect", "/Users/bryphe/ocaml-language-server/out/src/server/index.js", "--stdio"]
    }

    const serverOptions = {
        command,
        args: ["--stdio"],
    }

    const getInitializationOptionsAsync = (filePath) => {
        return Promise.resolve({
            clientName: "ocaml",
            rootPath: "file:///" + filePath,
            capabilities: {
                highlightProvider: true,
            }
        })
    }

    const client = Oni.createLanguageClient(debugOptions, getInitializationOptionsAsync)
}

module.exports = {
    activate
}
