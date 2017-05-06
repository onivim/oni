const fs = require("fs")
const path = require("path")
const childProcess = require("child_process")

const _ = require("lodash")
const rpc = require("vscode-jsonrpc")

const activate = (Oni) => {
    const serverOptions = {
        command: "go-langserver",
    }

    const client = Oni.createLanguageClient(serverOptions, (filePath) => {
                return Promise.resolve({
                    clientName: "go-langserver",
                    rootPath: "file:///" + path.dirname(filePath).split("\\").join("/"),
                    capabilities: {
                        highlightProvider: true
                    }
                })
            })
}

module.exports = {
    activate
}
