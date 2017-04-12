const path = require("path")
const childProcess = require("child_process")

const fs = require("fs")

const rpc = require("vscode-jsonrpc")

const activate = (Oni) => {

    const omniSharpLangServerPath = path.join(__dirname, "..", "..", "..", "..", "node_modules", "omnisharp-client", "languageserver", "server.js")

    const execCommand = `node "${omniSharpLangServerPath}"`

    const client = Oni.createLanguageClient(execCommand, (filePath) => {
            return Promise.resolve({
            rootPath: "C:/test/dotnet-core",
            capabilities: {
                highlightProvider: true
            }
        })
    })
}

module.exports = {
    activate
}
